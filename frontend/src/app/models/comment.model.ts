import { User } from './user.model';
import { Post, PostApiResponse } from './post.model';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  post_id: number;
  post: Post;
  author: User;
}

export interface CommentApiResponse extends Comment {
  like_count?: number;
  is_liked?: boolean;
}

export interface ReplyWithContext {
  original_post: PostApiResponse;
  reply: CommentApiResponse;
}
