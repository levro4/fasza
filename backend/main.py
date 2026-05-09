from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
import database, schemas, auth
from jose import JWTError, jwt
from typing import Optional

# Create the database tables
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Fake Twitter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _decode_username_from_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = _decode_username_from_token(token)
    if username is None:
        raise credentials_exception
    user = db.query(database.User).filter(database.User.username == username).first()
    if user is None:
        raise credentials_exception
    if user.is_suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    return user

def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[database.User]:
    if not token:
        return None
    username = _decode_username_from_token(token)
    if username is None:
        return None
    return db.query(database.User).filter(database.User.username == username).first()

def enrich_posts(posts, db: Session, current_user=None) -> list[schemas.PostResponse]:
    if not posts:
        return []
    post_ids = [p.id for p in posts]

    like_counts = dict(
        db.query(database.Like.post_id, func.count(database.Like.id))
        .filter(database.Like.post_id.in_(post_ids))
        .group_by(database.Like.post_id)
        .all()
    )
    repost_counts = dict(
        db.query(database.Post.original_post_id, func.count(database.Post.id))
        .filter(database.Post.original_post_id.in_(post_ids))
        .group_by(database.Post.original_post_id)
        .all()
    )

    liked_ids: set = set()
    reposted_ids: set = set()
    if current_user:
        liked_ids = {lid for (lid,) in db.query(database.Like.post_id)
            .filter(database.Like.post_id.in_(post_ids), database.Like.user_id == current_user.id).all()}
        reposted_ids = {pid for (pid,) in db.query(database.Post.original_post_id)
            .filter(database.Post.original_post_id.in_(post_ids), database.Post.owner_id == current_user.id).all()}

    # Fetch and enrich original posts for reposts
    original_post_ids = [p.original_post_id for p in posts if p.original_post_id]
    original_posts_map: dict = {}
    if original_post_ids:
        orig_db_posts = (
            db.query(database.Post)
            .options(joinedload(database.Post.owner))
            .filter(database.Post.id.in_(original_post_ids))
            .all()
        )
        for enriched in enrich_posts(orig_db_posts, db, current_user):
            original_posts_map[enriched.id] = enriched

    result = []
    for post in posts:
        base = schemas.PostResponse.model_validate(post)
        result.append(base.model_copy(update={
            "like_count": like_counts.get(post.id, 0),
            "repost_count": repost_counts.get(post.id, 0),
            "is_liked": post.id in liked_ids,
            "is_reposted": post.id in reposted_ids,
            "original_post": original_posts_map.get(post.original_post_id) if post.original_post_id else None,
        }))
    return result

def enrich_comments(comments, db: Session, current_user=None) -> list[schemas.CommentResponse]:
    if not comments:
        return []
    comment_ids = [c.id for c in comments]

    like_counts = dict(
        db.query(database.CommentLike.comment_id, func.count(database.CommentLike.id))
        .filter(database.CommentLike.comment_id.in_(comment_ids))
        .group_by(database.CommentLike.comment_id)
        .all()
    )

    liked_ids: set = set()
    if current_user:
        liked_ids = {cid for (cid,) in db.query(database.CommentLike.comment_id)
            .filter(database.CommentLike.comment_id.in_(comment_ids), database.CommentLike.user_id == current_user.id).all()}

    result = []
    for comment in comments:
        base = schemas.CommentResponse.model_validate(comment)
        result.append(base.model_copy(update={
            "like_count": like_counts.get(comment.id, 0),
            "is_liked": comment.id in liked_ids,
        }))
    return result

def enrich_user(user: database.User, db: Session, current_user=None) -> schemas.UserResponse:
    follower_count = db.query(database.Follower).filter(database.Follower.followed_id == user.id).count()
    following_count = db.query(database.Follower).filter(database.Follower.follower_id == user.id).count()
    is_following = False
    if current_user and current_user.id != user.id:
        is_following = db.query(database.Follower).filter(
            database.Follower.follower_id == current_user.id,
            database.Follower.followed_id == user.id
        ).first() is not None
    base = schemas.UserResponse.model_validate(user)
    return base.model_copy(update={
        "follower_count": follower_count,
        "following_count": following_count,
        "is_following": is_following,
    })

def get_current_admin(current_user: database.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

# --- AUTHENTICATION ---

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(database.User).filter(database.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(database.User).filter(database.User.email == user.email).first()
    if db_email:
         raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    # The first user will be an admin, others will be users
    role = "admin" if db.query(database.User).count() == 0 else "user"
    
    new_user = database.User(username=user.username, email=user.email, password_hash=hashed_password, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(database.User).filter(database.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.is_suspended:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
         
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- USERS (Admin only for some actions) ---

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return enrich_user(current_user, db)

@app.put("/users/me", response_model=schemas.UserResponse)
def update_users_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    if user_update.username is not None:
        if user_update.username != current_user.username:
            existing_user = db.query(database.User).filter(database.User.username == user_update.username).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username
        
    if user_update.displayName is not None:
        current_user.displayName = user_update.displayName
    if user_update.profileImage is not None:
        current_user.profileImage = user_update.profileImage
    if user_update.bannerImage is not None:
        current_user.bannerImage = user_update.bannerImage

    db.commit()
    db.refresh(current_user)
    return enrich_user(current_user, db)

@app.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    uid = current_user.id

    db.query(database.Notification).filter(
        or_(database.Notification.user_id == uid, database.Notification.actor_id == uid)
    ).delete(synchronize_session=False)
    db.query(database.CommentLike).filter(database.CommentLike.user_id == uid).delete(synchronize_session=False)
    db.query(database.Like).filter(database.Like.user_id == uid).delete(synchronize_session=False)

    user_post_ids = [pid for (pid,) in db.query(database.Post.id).filter(database.Post.owner_id == uid).all()]
    if user_post_ids:
        other_repost_ids = [pid for (pid,) in db.query(database.Post.id).filter(
            database.Post.original_post_id.in_(user_post_ids),
            database.Post.owner_id != uid
        ).all()]
        if other_repost_ids:
            db.query(database.Notification).filter(database.Notification.post_id.in_(other_repost_ids)).delete(synchronize_session=False)
            db.query(database.Like).filter(database.Like.post_id.in_(other_repost_ids)).delete(synchronize_session=False)
            repost_comment_ids = [cid for (cid,) in db.query(database.Comment.id).filter(database.Comment.post_id.in_(other_repost_ids)).all()]
            if repost_comment_ids:
                db.query(database.CommentLike).filter(database.CommentLike.comment_id.in_(repost_comment_ids)).delete(synchronize_session=False)
            db.query(database.Comment).filter(database.Comment.post_id.in_(other_repost_ids)).delete(synchronize_session=False)
            db.query(database.Post).filter(database.Post.id.in_(other_repost_ids)).delete(synchronize_session=False)

        db.query(database.Like).filter(database.Like.post_id.in_(user_post_ids)).delete(synchronize_session=False)
        db.query(database.Notification).filter(database.Notification.post_id.in_(user_post_ids)).delete(synchronize_session=False)
        post_comment_ids = [cid for (cid,) in db.query(database.Comment.id).filter(database.Comment.post_id.in_(user_post_ids)).all()]
        if post_comment_ids:
            db.query(database.CommentLike).filter(database.CommentLike.comment_id.in_(post_comment_ids)).delete(synchronize_session=False)
        db.query(database.Comment).filter(database.Comment.post_id.in_(user_post_ids)).delete(synchronize_session=False)
        db.query(database.Post).filter(database.Post.id.in_(user_post_ids)).delete(synchronize_session=False)

    user_comment_ids = [cid for (cid,) in db.query(database.Comment.id).filter(database.Comment.user_id == uid).all()]
    if user_comment_ids:
        db.query(database.CommentLike).filter(database.CommentLike.comment_id.in_(user_comment_ids)).delete(synchronize_session=False)
        db.query(database.Comment).filter(database.Comment.id.in_(user_comment_ids)).delete(synchronize_session=False)

    db.query(database.Follower).filter(
        or_(database.Follower.follower_id == uid, database.Follower.followed_id == uid)
    ).delete(synchronize_session=False)

    db.delete(current_user)
    db.commit()

@app.get("/admin/suspended-users", response_model=list[schemas.UserResponse])
def get_suspended_users(db: Session = Depends(get_db), admin: database.User = Depends(get_current_admin)):
    users = db.query(database.User).filter(database.User.is_suspended == True).all()
    return [enrich_user(u, db) for u in users]

@app.get("/users/by-username/{username}", response_model=schemas.UserResponse)
def get_user_by_username(username: str, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    user = db.query(database.User).filter(database.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_suspended and (not current_user or current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="User not found")
    return enrich_user(user, db, current_user)

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_suspended and (not current_user or current_user.role != "admin"):
        raise HTTPException(status_code=404, detail="User not found")
    return enrich_user(user, db, current_user)

@app.get("/users/", response_model=list[schemas.UserResponse])
def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(database.User).offset(skip).limit(limit).all()
    return users

@app.put("/users/{user_id}/suspend", response_model=schemas.UserResponse)
def suspend_user(user_id: int, db: Session = Depends(get_db), admin: database.User = Depends(get_current_admin)):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
         raise HTTPException(status_code=403, detail="Cannot suspend an admin")
         
    user.is_suspended = not user.is_suspended # Toggle suspension
    db.commit()
    db.refresh(user)
    return user

# --- POSTS ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Fake Twitter API"}

def create_notifications_for_followers(actor_id: int, post_id: int, notif_type: str, db: Session):
    follower_ids = [fid for (fid,) in db.query(database.Follower.follower_id)
        .filter(database.Follower.followed_id == actor_id).all()]
    db.add_all([
        database.Notification(user_id=fid, actor_id=actor_id, post_id=post_id, type=notif_type)
        for fid in follower_ids
    ])
    db.commit()

@app.post("/posts/", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = database.Post(content=post.content, owner_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    create_notifications_for_followers(current_user.id, db_post.id, "new_post", db)
    return db_post

@app.get("/posts/", response_model=list[schemas.PostResponse])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    suspended_ids = db.query(database.User.id).filter(database.User.is_suspended == True)
    posts = db.query(database.Post) \
        .options(joinedload(database.Post.owner)) \
        .filter(database.Post.owner_id.notin_(suspended_ids)) \
        .order_by(database.Post.created_at.desc()) \
        .offset(skip) \
        .limit(limit) \
        .all()
    return enrich_posts(posts, db, current_user)

@app.get("/posts/{post_id}", response_model=schemas.PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    post = db.query(database.Post) \
        .options(joinedload(database.Post.owner)) \
        .filter(database.Post.id == post_id) \
        .first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return enrich_posts([post], db, current_user)[0]

@app.get("/feed", response_model=list[schemas.PostResponse])
def get_feed(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    following_ids = [fid for (fid,) in db.query(database.Follower.followed_id).filter(database.Follower.follower_id == current_user.id).all()]
    following_ids.append(current_user.id)

    # Admin posts are always included in every user's feed
    admin_ids = [uid for (uid,) in db.query(database.User.id).filter(database.User.role == "admin").all()]
    all_ids = list(set(following_ids + admin_ids))

    suspended_ids = db.query(database.User.id).filter(database.User.is_suspended == True)
    posts = db.query(database.Post) \
        .options(joinedload(database.Post.owner)) \
        .filter(database.Post.owner_id.in_(all_ids)) \
        .filter(database.Post.owner_id.notin_(suspended_ids)) \
        .order_by(database.Post.created_at.desc()) \
        .offset(skip) \
        .limit(limit) \
        .all()
    return enrich_posts(posts, db, current_user)

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if db_post.owner_id != current_user.id and current_user.role != "admin":
         raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    # Delete all reposts first — bulk queries bypass ORM cascade so clean up manually
    repost_ids = [r.id for r in db.query(database.Post).filter(database.Post.original_post_id == post_id).all()]
    if repost_ids:
        db.query(database.Notification).filter(database.Notification.post_id.in_(repost_ids)).delete(synchronize_session=False)
        db.query(database.Like).filter(database.Like.post_id.in_(repost_ids)).delete(synchronize_session=False)
        db.query(database.Comment).filter(database.Comment.post_id.in_(repost_ids)).delete(synchronize_session=False)
        db.query(database.Post).filter(database.Post.id.in_(repost_ids)).delete(synchronize_session=False)

    # Clean up the original post's likes and notifications, then delete it.
    # Comments are handled automatically by the cascade="all, delete-orphan" on Post.comments.
    db.query(database.Notification).filter(database.Notification.post_id == post_id).delete()
    db.query(database.Like).filter(database.Like.post_id == post_id).delete()
    db.delete(db_post)
    db.commit()

@app.put("/posts/{post_id}", response_model=schemas.PostResponse)
def update_post(post_id: int, post_update: schemas.PostCreate, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if db_post.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to update this post")
         
    db_post.content = post_update.content
    db.commit()
    db.refresh(db_post)
    return db_post

@app.post("/posts/{post_id}/retweet", response_model=schemas.RetweetResponse)
def retweet_post(post_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    original_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not original_post:
        raise HTTPException(status_code=404, detail="Original post not found")

    existing_retweet = db.query(database.Post).filter(
        database.Post.owner_id == current_user.id,
        database.Post.original_post_id == post_id
    ).first()

    if existing_retweet:
        db.delete(existing_retweet)
        db.commit()
        repost_count = db.query(database.Post).filter(database.Post.original_post_id == post_id).count()
        return {"is_reposted": False, "repost_count": repost_count}

    username = original_post.owner.username if original_post.owner else "unknown"
    repost = database.Post(
        content=f"RT @{username}: {original_post.content[:50]}...",
        owner_id=current_user.id,
        original_post_id=original_post.id
    )
    db.add(repost)
    db.commit()
    db.refresh(repost)
    create_notifications_for_followers(current_user.id, original_post.id, "repost", db)
    repost_count = db.query(database.Post).filter(database.Post.original_post_id == post_id).count()
    return {"is_reposted": True, "repost_count": repost_count}

# --- COMMENTS ---

@app.post("/posts/{post_id}/comments/", response_model=schemas.CommentResponse)
def create_comment(post_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_comment = database.Comment(content=comment.content, post_id=post_id, user_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    db_comment = (
        db.query(database.Comment)
        .options(joinedload(database.Comment.author))
        .filter(database.Comment.id == db_comment.id)
        .first()
    )
    return db_comment

@app.get("/posts/{post_id}/comments/", response_model=list[schemas.CommentResponse])
def read_comments(post_id: int, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    comments = (
        db.query(database.Comment)
        .options(joinedload(database.Comment.author))
        .filter(database.Comment.post_id == post_id)
        .all()
    )
    return enrich_comments(comments, db, current_user)

@app.get("/users/{user_id}/replies", response_model=list[schemas.ReplyWithContextResponse])
def get_user_replies(user_id: int, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    comments = (
        db.query(database.Comment)
        .options(joinedload(database.Comment.author))
        .filter(database.Comment.user_id == user_id)
        .order_by(database.Comment.created_at.desc())
        .all()
    )
    if not comments:
        return []

    post_ids = list({c.post_id for c in comments})
    posts = (
        db.query(database.Post)
        .options(joinedload(database.Post.owner))
        .filter(database.Post.id.in_(post_ids))
        .all()
    )

    enriched_posts = {ep.id: ep for ep in enrich_posts(posts, db, current_user)}
    enriched_comments = enrich_comments(comments, db, current_user)

    return [
        schemas.ReplyWithContextResponse(original_post=enriched_posts[c.post_id], reply=c)
        for c in enriched_comments if c.post_id in enriched_posts
    ]

@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_comment = db.query(database.Comment).filter(database.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(db_comment)
    db.commit()

@app.post("/comments/{comment_id}/like", response_model=schemas.CommentLikeResponse)
def like_comment(comment_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_comment = db.query(database.Comment).filter(database.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    db_like = db.query(database.CommentLike).filter(
        database.CommentLike.comment_id == comment_id,
        database.CommentLike.user_id == current_user.id
    ).first()
    if db_like:
        db.delete(db_like)
        db.commit()
    else:
        db.add(database.CommentLike(comment_id=comment_id, user_id=current_user.id))
        db.commit()

    like_count = db.query(database.CommentLike).filter(database.CommentLike.comment_id == comment_id).count()
    return {"is_liked": db_like is None, "like_count": like_count}

# --- LIKES ---

@app.post("/posts/{post_id}/like", response_model=schemas.LikeResponse)
def like_post(
        post_id: int,
        db: Session = Depends(get_db),
        current_user: database.User = Depends(get_current_user)
):
    db_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_like = db.query(database.Like).filter(
        database.Like.post_id == post_id,
        database.Like.user_id == current_user.id
    ).first()

    if db_like:
        db.delete(db_like)
        db.commit()
        liked = False
    else:
        new_like = database.Like(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        liked = True

    like_count = db.query(database.Like).filter(
        database.Like.post_id == post_id
    ).count()

    return {
        "is_liked": liked,
        "like_count": like_count
    }

# --- FOLLOWS ---

@app.post("/users/{user_id}/follow", response_model=schemas.FollowResponse)
def follow_user(user_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    user_to_follow = db.query(database.User).filter(database.User.id == user_id).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User not found")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    db_follow = db.query(database.Follower).filter(
        database.Follower.follower_id == current_user.id,
        database.Follower.followed_id == user_id
    ).first()
    if db_follow:
        db.delete(db_follow)
        db.commit()
        return {"is_following": False}

    db.add(database.Follower(follower_id=current_user.id, followed_id=user_id))
    db.add(database.Notification(user_id=user_id, actor_id=current_user.id, type="follow"))
    db.commit()
    return {"is_following": True}

@app.get("/users/{user_id}/followers", response_model=list[schemas.UserSummary])
def get_user_followers(user_id: int, db: Session = Depends(get_db)):
    return (db.query(database.User)
        .join(database.Follower, database.Follower.follower_id == database.User.id)
        .filter(database.Follower.followed_id == user_id)
        .all())

@app.get("/users/{user_id}/following", response_model=list[schemas.UserSummary])
def get_user_following(user_id: int, db: Session = Depends(get_db)):
    return (db.query(database.User)
        .join(database.Follower, database.Follower.followed_id == database.User.id)
        .filter(database.Follower.follower_id == user_id)
        .all())

@app.get("/users/{user_id}/posts", response_model=list[schemas.PostResponse])
def get_user_posts(user_id: int, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    posts = (
        db.query(database.Post)
        .options(joinedload(database.Post.owner))
        .filter(database.Post.owner_id == user_id)
        .order_by(database.Post.created_at.desc())
        .all()
    )
    return enrich_posts(posts, db, current_user)

@app.get("/users/{user_id}/likes", response_model=list[schemas.PostResponse])
def get_user_likes(user_id: int, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    liked_post_ids = [lid for (lid,) in db.query(database.Like.post_id).filter(database.Like.user_id == user_id).all()]
    if not liked_post_ids:
        return []
    posts = (
        db.query(database.Post)
        .options(joinedload(database.Post.owner))
        .filter(database.Post.id.in_(liked_post_ids))
        .order_by(database.Post.created_at.desc())
        .all()
    )
    return enrich_posts(posts, db, current_user)

@app.get("/explore", response_model=list[schemas.PostResponse])
def get_explore_feed(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: Optional[database.User] = Depends(get_optional_current_user)):
    suspended_ids = db.query(database.User.id).filter(database.User.is_suspended == True)
    query = db.query(database.Post).options(joinedload(database.Post.owner))
    query = query.filter(database.Post.owner_id.notin_(suspended_ids))
    if current_user:
        following_ids = [fid for (fid,) in db.query(database.Follower.followed_id)
            .filter(database.Follower.follower_id == current_user.id).all()]
        excluded = set(following_ids) | {current_user.id}
        query = query.filter(database.Post.owner_id.notin_(excluded))
    posts = query.order_by(database.Post.created_at.desc()).offset(skip).limit(limit).all()
    return enrich_posts(posts, db, current_user)

# --- NOTIFICATIONS ---

@app.get("/notifications/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    count = db.query(database.Notification).filter(
        database.Notification.user_id == current_user.id,
        database.Notification.is_read == False
    ).count()
    return {"count": count}

@app.get("/notifications/", response_model=list[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    notifications = (
        db.query(database.Notification)
        .options(joinedload(database.Notification.actor), joinedload(database.Notification.post))
        .filter(database.Notification.user_id == current_user.id)
        .order_by(database.Notification.created_at.desc())
        .all()
    )
    result = []
    for n in notifications:
        if not n.actor:
            continue
        result.append(schemas.NotificationResponse(
            id=n.id,
            post_id=n.post_id,
            type=n.type,
            is_read=n.is_read,
            created_at=n.created_at,
            actor=schemas.UserSummary(
                id=n.actor.id,
                username=n.actor.username,
                displayName=n.actor.displayName,
                profileImage=n.actor.profileImage,
            ),
            post_content=n.post.content[:120] if n.post else None,
        ))
    return result

@app.put("/notifications/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    notif = db.query(database.Notification).filter(
        database.Notification.id == notification_id,
        database.Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
