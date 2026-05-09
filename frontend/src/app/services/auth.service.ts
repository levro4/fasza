import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (localStorage.getItem('access_token')) {
      this.fetchAndCache().subscribe();
    }
  }

  private fetchAndCache(): Observable<User | null> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  getLoggedInUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`);
  }

  getOptionalUser(): Observable<User | null> {
    return this.currentUser$;
  }

  refreshCurrentUser(): void {
    this.fetchAndCache().subscribe();
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  updateUser(userData: { userName?: string, displayName?: string, profileImage?: string, bannerImage?: string }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/me`, userData).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/me`).pipe(
      tap(() => {
        localStorage.removeItem('access_token');
        this.currentUserSubject.next(null);
      })
    );
  }
}
