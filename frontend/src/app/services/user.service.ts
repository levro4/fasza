import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { PostApiResponse } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  getUserPosts(userId: number): Observable<PostApiResponse[]> {
    return this.http.get<PostApiResponse[]>(`${environment.apiUrl}/users/${userId}/posts`);
  }

  getUserLikes(userId: number): Observable<PostApiResponse[]> {
    return this.http.get<PostApiResponse[]>(`${environment.apiUrl}/users/${userId}/likes`);
  }

  followUser(userId: number): Observable<{ is_following: boolean }> {
    return this.http.post<{ is_following: boolean }>(`${environment.apiUrl}/users/${userId}/follow`, {});
  }

  getUserFollowers(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/${userId}/followers`);
  }

  getUserFollowing(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users/${userId}/following`);
  }

  suspendUser(userId: number): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${userId}/suspend`, {});
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/by-username/${username}`);
  }

  getSuspendedUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/admin/suspended-users`);
  }

  getExploreFeed(): Observable<PostApiResponse[]> {
    return this.http.get<PostApiResponse[]>(`${environment.apiUrl}/explore`);
  }
}
