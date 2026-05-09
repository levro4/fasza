import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications/`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/${id}/read`, {});
  }

  fetchUnreadCount(): void {
    this.http.get<{ count: number }>(`${environment.apiUrl}/notifications/unread-count`).subscribe({
      next: (res) => this.unreadCountSubject.next(res.count),
      error: () => {},
    });
  }

  decrementUnreadCount(): void {
    const current = this.unreadCountSubject.value;
    if (current > 0) this.unreadCountSubject.next(current - 1);
  }
}
