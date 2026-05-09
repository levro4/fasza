from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./twitter_clone.db"

# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 1. User Entity
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user") # 'admin' or 'user'
    is_suspended = Column(Boolean, default=False)
    displayName = Column(String, nullable=True)
    profileImage = Column(String, default="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png")
    bannerImage = Column(String, nullable=True)

    posts = relationship("Post", back_populates="owner")
    comments = relationship("Comment", back_populates="author")

# 2. Post (Tweet) Entity
class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
    owner_id = Column(Integer, ForeignKey("users.id"))
    original_post_id = Column(Integer, ForeignKey("posts.id"), nullable=True) # For retweets

    owner = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    original_post = relationship("Post", remote_side=[id])

# 3. Comment (Reply) Entity
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.now)

    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")


# 4. Like Entity (Mapping table)
class Like(Base):
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    post_id = Column(Integer, ForeignKey("posts.id"))

# 5. CommentLike Entity (Mapping table)
class CommentLike(Base):
    __tablename__ = "comment_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    comment_id = Column(Integer, ForeignKey("comments.id"))

# 6. Follower Entity (Mapping table)
class Follower(Base):
    __tablename__ = "followers"

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    followed_id = Column(Integer, ForeignKey("users.id"))

# 7. Notification Entity
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))   # recipient
    actor_id = Column(Integer, ForeignKey("users.id"))  # who triggered it
    post_id = Column(Integer, ForeignKey("posts.id"))
    type = Column(String)  # 'new_post' or 'repost'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.now)

    actor = relationship("User", foreign_keys=[actor_id])
    post = relationship("Post", foreign_keys=[post_id])
