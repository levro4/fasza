# schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserUpdate(BaseModel):
    displayName: Optional[str] = None
    username: Optional[str] = None
    profileImage: Optional[str] = None
    bannerImage: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_suspended: bool
    displayName: Optional[str] = None
    profileImage: Optional[str] = None
    bannerImage: Optional[str] = None
    created_at: Optional[datetime] = None
    follower_count: int = 0
    following_count: int = 0
    is_following: bool = False

    class Config:
        from_attributes = True

class FollowResponse(BaseModel):
    is_following: bool

class PostBase(BaseModel):
    content: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    created_at: datetime
    owner_id: int
    original_post_id: Optional[int] = None
    original_post: Optional['PostResponse'] = None
    owner: UserResponse
    like_count: int = 0
    repost_count: int = 0
    is_liked: bool = False
    is_reposted: bool = False

    class Config:
        from_attributes = True

PostResponse.model_rebuild()

class LikeResponse(BaseModel):
    is_liked: bool
    like_count: int

class RetweetResponse(BaseModel):
    is_reposted: bool
    repost_count: int
    
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass  # no parent_comment_id anymore

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    post_id: int
    author: UserResponse
    like_count: int = 0
    is_liked: bool = False

    class Config:
        from_attributes = True

class CommentLikeResponse(BaseModel):
    is_liked: bool
    like_count: int

class ReplyWithContextResponse(BaseModel):
    original_post: PostResponse
    reply: CommentResponse

class UserSummary(BaseModel):
    id: int
    username: str
    displayName: Optional[str] = None
    profileImage: Optional[str] = None

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    post_id: Optional[int] = None
    type: str
    is_read: bool
    created_at: datetime
    actor: UserSummary
    post_content: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
