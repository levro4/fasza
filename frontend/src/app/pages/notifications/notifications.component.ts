import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  private notifService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  notifications: Notification[] = [];
  isLoading = true;
  defaultProfilePictureUrl = environment.defaultProfilePictureUrl;

  ngOnInit(): void {
    this.notifService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onNotificationClick(notif: Notification): void {
    if (!notif.is_read) {
      notif.is_read = true;
      this.notifService.markAsRead(notif.id).subscribe();
      this.notifService.decrementUnreadCount();
    }
    if (notif.type === 'follow') {
      this.router.navigate(['/profile', notif.actor.id]);
    } else {
      this.router.navigate(['/post', notif.post_id]);
    }
  }

  getMessage(notif: Notification): string {
    const name = notif.actor.displayName || notif.actor.username;
    if (notif.type === 'new_post') return `${name} posted a new post`;
    if (notif.type === 'repost') return `${name} reposted`;
    return `${name} followed you`;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }
}
