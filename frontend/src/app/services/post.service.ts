import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/posts/`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${environment.apiUrl}/posts/${id}`);
  }

  getCommentsForPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${environment.apiUrl}/posts/${postId}/comments/`);
  }

  createPost(content: string): Observable<Post> {
    return this.http.post<Post>(`${environment.apiUrl}/posts/`, { content });
  }

  createComment(postId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${environment.apiUrl}/posts/${postId}/comments/`, { content });
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

  retweetPost(postId: number): Observable<Post> {
    return this.http.post<Post>(`${environment.apiUrl}/posts/${postId}/retweet`, {});
  }

  getFeed(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.apiUrl}/feed`);
  }
}
