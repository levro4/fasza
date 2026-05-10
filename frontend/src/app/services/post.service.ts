import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post, PostApiResponse } from '../models/post.model';
import { Comment, CommentApiResponse, ReplyWithContext } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private feedChangedSource = new Subject<void>();

  feedChanged$ = this.feedChangedSource.asObservable();
  // alias kept so the sidebar doesn't need changing
  postCreated$ = this.feedChanged$;

  constructor(private http: HttpClient) {}

  notifyFeedChanged() {
    this.feedChangedSource.next();
  }

  notifyPostCreated() {
    this.feedChangedSource.next();
  }

  getPosts(): Observable<PostApiResponse[]> {
    return this.http.get<PostApiResponse[]>(`${environment.apiUrl}/posts/`);
  }

  getPostById(id: number): Observable<PostApiResponse> {
    return this.http.get<PostApiResponse>(`${environment.apiUrl}/posts/${id}`);
  }

  getCommentsForPost(postId: number): Observable<CommentApiResponse[]> {
    return this.http.get<CommentApiResponse[]>(`${environment.apiUrl}/posts/${postId}/comments/`);
  }

  getUserReplies(userId: number): Observable<ReplyWithContext[]> {
    return this.http.get<ReplyWithContext[]>(`${environment.apiUrl}/users/${userId}/replies`);
  }

  createPost(content: string): Observable<Post> {
    return this.http.post<Post>(`${environment.apiUrl}/posts/`, { content });
  }

  createComment(postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/posts/${postId}/comments/`, { content });
  }

  updatePost(postId: number, content: string): Observable<PostApiResponse> {
    return this.http.put<PostApiResponse>(`${environment.apiUrl}/posts/${postId}`, { content });
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${postId}`);
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/comments/${commentId}`);
  }

  likePost(postId: number): Observable<{ is_liked: boolean; like_count: number }> {
    return this.http.post<{ is_liked: boolean; like_count: number }>(
      `${environment.apiUrl}/posts/${postId}/like`,
      {},
    );
  }

  likeComment(commentId: number): Observable<{ is_liked: boolean; like_count: number }> {
    return this.http.post<{ is_liked: boolean; like_count: number }>(
      `${environment.apiUrl}/comments/${commentId}/like`,
      {},
    );
  }

  retweetPost(postId: number): Observable<{ is_reposted: boolean; repost_count: number }> {
    return this.http.post<{ is_reposted: boolean; repost_count: number }>(
      `${environment.apiUrl}/posts/${postId}/retweet`,
      {},
    );
  }

  getFeed(): Observable<PostApiResponse[]> {
    return this.http.get<PostApiResponse[]>(`${environment.apiUrl}/feed`);
  }
}
