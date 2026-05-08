import { User } from './user.model';
import { Post } from './post.model';

export interface Comment {
  id: number;
  content: string;
  created_at: string;

  user_id: number;
  post_id: number;
  post: Post;
  author: User;
}
