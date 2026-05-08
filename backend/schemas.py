# schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

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

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    content: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    content: str
    created_at: datetime
    owner_id: int
    original_post_id: Optional[int] = None
    owner: UserResponse

    class Config:
        from_attributes = True

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    post_id: int
    author: UserResponse

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
