import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  isPostModalOpen = false;
  postContent = '';
  unreadCount = 0;
  _isLoggedIn = !!localStorage.getItem('access_token');
  _isAdmin = false;
  isSubmitting = false;

  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private notifService = inject(NotificationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  private unreadSub?: Subscription;
  private userSub?: Subscription;
  private pollInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this._isLoggedIn) {
      this.notifService.fetchUnreadCount();
      this.pollInterval = setInterval(() => this.notifService.fetchUnreadCount(), 30000);
    }
    this.unreadSub = this.notifService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });
    this.userSub = this.authService.getOptionalUser().subscribe(user => {
      this._isAdmin = user?.role === 'admin';
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
    this.userSub?.unsubscribe();
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  isAdmin(): boolean {
    return this._isAdmin;
  }

  openPostModal() {
    this.isPostModalOpen = true;
  }

  closePostModal() {
    this.isPostModalOpen = false;
    this.postContent = '';
    this.cdr.detectChanges();
  }

  onPostContentChange(event: Event) {
    this.postContent = (event.target as HTMLTextAreaElement).value;
  }

  submitPost() {
    const trimmedContent = this.postContent.trim();
    if (trimmedContent) {
      this.postService.createPost(trimmedContent).subscribe({
        next: () => {
          this.closePostModal();
          this.postService.notifyPostCreated();
          this.toastService.success('Your post has been published!');
        },
        error: () => {
          this.toastService.error('Failed to publish post. Please try again.');
        },
      });
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    this._isLoggedIn = false;
    window.location.reload();
  }

  isLoggedIn(): boolean {
    return this._isLoggedIn;
  }
}
