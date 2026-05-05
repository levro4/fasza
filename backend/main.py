from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database, schemas, auth
from jose import JWTError, jwt
from typing import List, Optional

# Create the database tables
database.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Fake Twitter API")

# VERY IMPORTANT FOR ANGULAR: Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], # Your Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(database.User).filter(database.User.username == username).first()
    if user is None:
        raise credentials_exception
    if user.is_suspended:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account suspended")
    return user

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
def read_users_me(current_user: database.User = Depends(get_current_user)):
    return current_user

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(database.User).filter(database.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

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

@app.post("/posts/", response_model=schemas.PostResponse)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = database.Post(content=post.content, owner_id=current_user.id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/posts/", response_model=list[schemas.PostResponse])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(database.Post).order_by(database.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@app.get("/posts/{post_id}", response_model=schemas.PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.get("/feed", response_model=list[schemas.PostResponse])
def get_feed(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    # Get IDs of users the current user follows
    following_ids = db.query(database.Follower.followed_id).filter(database.Follower.follower_id == current_user.id).all()
    following_ids = [fid[0] for fid in following_ids]
    
    # Include the user's own posts in their feed
    following_ids.append(current_user.id)
    
    # Query posts by those users
    posts = db.query(database.Post).filter(database.Post.owner_id.in_(following_ids)).order_by(database.Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts

@app.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if db_post.owner_id != current_user.id and current_user.role != "admin":
         raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(db_post)
    db.commit()
    return {"ok": True}

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

@app.post("/posts/{post_id}/retweet", response_model=schemas.PostResponse)
def retweet_post(post_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    original_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not original_post:
        raise HTTPException(status_code=404, detail="Original post not found")
    
    # Optional check if already retweeted
    existing_retweet = db.query(database.Post).filter(
        database.Post.owner_id == current_user.id,
        database.Post.original_post_id == post_id
    ).first()

    if existing_retweet:
        raise HTTPException(status_code=400, detail="You already retweeted this post")

    # A retweet could have empty content or original content
    retweet = database.Post(
        content=f"RT @{original_post.owner.username}: {original_post.content[:50]}...",
        owner_id=current_user.id,
        original_post_id=original_post.id
    )
    db.add(retweet)
    db.commit()
    db.refresh(retweet)
    return retweet

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
    return db_comment

@app.get("/posts/{post_id}/comments/", response_model=List[schemas.CommentResponse])
def read_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(database.Comment).filter(database.Comment.post_id == post_id).all()
    return comments

@app.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_comment = db.query(database.Comment).filter(database.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if db_comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(db_comment)
    db.commit()
    return {"ok": True}

# --- LIKES ---

@app.post("/posts/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def like_post(post_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    db_post = db.query(database.Post).filter(database.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")

    db_like = db.query(database.Like).filter(database.Like.post_id == post_id, database.Like.user_id == current_user.id).first()
    if db_like:
        # Unlike if already liked
        db.delete(db_like)
        db.commit()
        return {"status": "unliked"}
    
    new_like = database.Like(post_id=post_id, user_id=current_user.id)
    db.add(new_like)
    db.commit()
    return {"status": "liked"}

# --- FOLLOWS ---

@app.post("/users/{user_id}/follow", status_code=status.HTTP_204_NO_CONTENT)
def follow_user(user_id: int, db: Session = Depends(get_db), current_user: database.User = Depends(get_current_user)):
    user_to_follow = db.query(database.User).filter(database.User.id == user_id).first()
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User to follow not found")
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    db_follow = db.query(database.Follower).filter(database.Follower.follower_id == current_user.id, database.Follower.followed_id == user_id).first()
    if db_follow:
        # Unfollow if already following
        db.delete(db_follow)
        db.commit()
        return {"status": "unfollowed"}

    new_follow = database.Follower(follower_id=current_user.id, followed_id=user_id)
    db.add(new_follow)
    db.commit()
    return {"status": "followed"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
