import { User } from './user.model';

export interface Post {
  id: number;
  content: string;
  created_at: string;
  owner_id: number;
  owner: User;
  original_post_id?: number;
  original_post?: Post;

  // Frontend specific / unified fields
  isBookmarked?: boolean;
  hashtags?: string[];
  likes?: number;
  isLiked?: boolean;
  reposts?: number;
  isReposted?: boolean;
  views?: number;
}
