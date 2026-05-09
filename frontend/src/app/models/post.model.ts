import { User } from './user.model';

export interface Post {
  id: number;
  content: string;
  created_at: string;
  owner_id: number;
  owner: User;
  original_post_id?: number;
  original_post?: Post;
  isBookmarked?: boolean;
  hashtags?: string[];
  likes?: number;
  isLiked?: boolean;
  reposts?: number;
  isReposted?: boolean;
  views?: number;
  commentCount?: number;
}

export interface PostApiResponse extends Post {
  like_count?: number;
  repost_count?: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  original_post?: PostApiResponse;
}
