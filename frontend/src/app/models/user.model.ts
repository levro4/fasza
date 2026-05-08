export interface User {
  id?: number;
  username: string;
  email?: string;
  role?: string;
  is_suspended?: boolean;
  displayName?: string;
  bannerImage?: string;
  profileImage: string;
  joinDate?: string;
  followingCount?: number;
  followersCount?: number;
}
