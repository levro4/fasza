export interface Notification {
  id: number;
  post_id?: number;
  type: 'new_post' | 'repost' | 'follow';
  is_read: boolean;
  created_at: string;
  actor: {
    id: number;
    username: string;
    displayName?: string;
    profileImage?: string;
  };
  post_content?: string;
}
