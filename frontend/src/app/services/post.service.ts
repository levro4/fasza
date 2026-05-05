import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post } from '../components/post/post.component';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  is_suspended: boolean;
  displayName: string;
  bannerImage: string;
  profileImage: string;
  joinDate: string;
  followingCount: number;
  followersCount: number;
}

export interface PostResponse {
  id: number;
  content: string;
  created_at: string;
  owner_id: number;
  original_post_id?: number;
  owner: UserResponse;
  post: Post;
}

export interface CommentResponse {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  post_id: number;
  author: UserResponse;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}

  getPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${environment.apiUrl}/posts/`);
  }

  getPostById(id: number): Observable<PostResponse> {
    return this.http.get<PostResponse>(`${environment.apiUrl}/posts/${id}`);
  }

  getCommentsForPost(postId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${environment.apiUrl}/posts/${postId}/comments/`);
  }

  createPost(content: string): Observable<PostResponse> {
    return this.http.post<PostResponse>(`${environment.apiUrl}/posts/`, { content });
  }

  createComment(postId: number, content: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${environment.apiUrl}/posts/${postId}/comments/`, { content });
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${postId}`);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${commentId}`);
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/posts/${postId}/like`, {});
  }

  retweetPost(postId: number): Observable<PostResponse> {
    return this.http.post<PostResponse>(`${environment.apiUrl}/posts/${postId}/retweet`, {});
  }

  getFeed(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${environment.apiUrl}/feed`);
  }
}
