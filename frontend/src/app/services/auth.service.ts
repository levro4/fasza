import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  getLoggedInUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`);
  }

  updateUser(userData: { userName?: string, displayName?: string, profileImage?: string, bannerImage?: string }): Observable<User> {
    console.log(userData);
    return this.http.put<User>(`${environment.apiUrl}/users/me`, userData);
  }
}
