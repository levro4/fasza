import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserResponse } from './post.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  getLoggedInUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/users/me`);
  }
}
