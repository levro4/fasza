export interface User {
  id?: number;
  username: string;
  email?: string;
  role?: string;
  is_suspended?: boolean;
  displayName?: string;
  bannerImage?: string;
  profileImage?: string;
  created_at?: string;
  follower_count?: number;
  following_count?: number;
  is_following?: boolean;
}
