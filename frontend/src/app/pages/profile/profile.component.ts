import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { ReplyThreadComponent } from '../../components/reply-thread/reply-thread.component';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { User } from '../../models/user.model';
import { Post, PostApiResponse } from '../../models/post.model';
import { ReplyWithContext } from '../../models/comment.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PostComponent, ReplyThreadComponent, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  activeTab = 'Posts';
  tabs = ['Posts', 'Replies', 'Reposts', 'Likes'];

  isEditModalOpen = false;
  editForm = { displayName: '', profileImage: '', bannerImage: '' };

  followListModal: 'followers' | 'following' | null = null;
  followListUsers: any[] = [];
  followListLoading = false;

  user: User | null = null;
  loggedInUser: User | null = null;
  loggedInUserId: number | null = null;
  private loggedInSub?: Subscription;
  private paramSub?: Subscription;
  private feedSub?: Subscription;

  posts: Post[] = [];
  replies: ReplyWithContext[] = [];
  reposts: Post[] = [];
  likedPosts: Post[] = [];

  get isOwnProfile(): boolean {
    return this.user?.id === this.loggedInUserId;
  }

  get isAdmin(): boolean {
    return this.loggedInUser?.role === 'admin';
  }

  get canSuspend(): boolean {
    return this.isAdmin && !this.isOwnProfile && this.user?.role !== 'admin';
  }

  goBack() {
    window.history.back();
  }

  get activeTabIndex(): number {
    return this.tabs.indexOf(this.activeTab);
  }

  ngOnInit(): void {
    this.loggedInSub = this.authService.getOptionalUser().subscribe((loggedIn) => {
      this.loggedInUser = loggedIn;
      this.loggedInUserId = loggedIn?.id ?? null;
      this.cdr.detectChanges();
    });

    this.feedSub = this.postService.feedChanged$.subscribe(() => {
      if (this.user?.id) {
        this.loadContent(this.user.id);
      }
    });

    this.paramSub = this.route.paramMap.subscribe(params => {
      const paramId = params.get('id');
      this.resetContent();
      this.cdr.detectChanges();
      if (paramId) {
        this.loadProfileById(Number(paramId));
      } else if (this.loggedInUserId) {
        this.user = this.loggedInUser;
        this.loadContent(this.loggedInUserId);
        this.cdr.detectChanges();
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy(): void {
    this.loggedInSub?.unsubscribe();
    this.paramSub?.unsubscribe();
    this.feedSub?.unsubscribe();
  }

  private resetContent(): void {
    this.user = null;
    this.posts = [];
    this.replies = [];
    this.reposts = [];
    this.likedPosts = [];
    this.activeTab = 'Posts';
    this.followListModal = null;
    this.followListUsers = [];
  }

  private loadProfileById(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loadContent(userId);
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/home']),
    });
  }

  private loadContent(userId: number): void {
    this.userService.getUserPosts(userId).subscribe((rawPosts) => {
      const all = rawPosts.map((pr) => this.mapPost(pr));
      this.posts = all.filter((p) => !p.original_post_id);
      this.reposts = all.filter((p) => !!p.original_post_id);
      this.cdr.detectChanges();
    });

    this.userService.getUserLikes(userId).subscribe((rawPosts) => {
      this.likedPosts = rawPosts.map((pr) => this.mapPost(pr));
      this.cdr.detectChanges();
    });

    this.postService.getUserReplies(userId).subscribe((items) => {
      this.replies = items;
      this.cdr.detectChanges();
    });
  }

  private mapPost(pr: PostApiResponse): Post {
    const owner = pr.owner;
    return {
      id: pr.id,
      content: pr.content,
      created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
      owner: {
        id: owner?.id,
        displayName: owner?.displayName || owner?.username || 'Unknown',
        username: `@${owner?.username || 'unknown'}`,
        profileImage: owner?.profileImage || 'https://i.pravatar.cc/150?u=' + (owner?.id || 1),
      },
      owner_id: pr.owner_id,
      original_post_id: pr.original_post_id,
      original_post: pr.original_post ? this.mapPost(pr.original_post) : undefined,
      likes: pr.like_count ?? 0,
      isLiked: pr.is_liked ?? false,
      reposts: pr.repost_count ?? 0,
      isReposted: pr.is_reposted ?? false,
      isBookmarked: false,
      hashtags: [],
      views: 0,
      commentCount: 0,
    };
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleFollow() {
    if (!this.user?.id) return;
    this.userService.followUser(this.user.id).subscribe((res) => {
      if (this.user) {
        this.user = {
          ...this.user,
          is_following: res.is_following,
          follower_count: (this.user.follower_count ?? 0) + (res.is_following ? 1 : -1),
        };
        this.cdr.detectChanges();
      }
    });
  }

  openFollowList(type: 'followers' | 'following') {
    if (!this.user?.id) return;
    this.followListModal = type;
    this.followListUsers = [];
    this.followListLoading = true;
    const request = type === 'followers'
      ? this.userService.getUserFollowers(this.user.id)
      : this.userService.getUserFollowing(this.user.id);
    request.subscribe({
      next: (users) => {
        this.followListUsers = users;
        this.followListLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.followListLoading = false; },
    });
  }

  closeFollowList() {
    this.followListModal = null;
    this.followListUsers = [];
  }

  goToUser(userId: number) {
    this.closeFollowList();
    this.router.navigate(['/profile', userId]);
  }

  async toggleSuspend() {
    if (!this.user?.id) return;
    const isSuspended = this.user.is_suspended;
    const action = isSuspended ? 'unsuspend' : 'suspend';

    const confirmed = await this.confirmDialog.confirm(
      `Are you sure you want to ${action} @${this.user.username}? ${isSuspended ? 'They will regain access to the platform.' : 'They will lose access to the platform.'}`,
      isSuspended ? 'Unsuspend' : 'Suspend'
    );
    if (!confirmed) return;

    this.userService.suspendUser(this.user.id).subscribe({
      next: (updated) => {
        this.user = { ...this.user!, is_suspended: updated.is_suspended };
        this.toastService.success(`User ${action}ed successfully.`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error(`Failed to ${action} user.`);
      },
    });
  }

  onPostDeleted(postId: number): void {
    this.posts = this.posts.filter(p => p.id !== postId);
    this.reposts = this.reposts.filter(p => p.id !== postId);
    this.likedPosts = this.likedPosts.filter(p => p.id !== postId);
    this.cdr.detectChanges();
  }

  openEditModal() {
    if (!this.user) return;
    this.editForm = {
      displayName: this.user.displayName || this.user.username,
      profileImage: this.user.profileImage || '',
      bannerImage: this.user.bannerImage || '',
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  saveProfile() {
    if (!this.user) return;
    this.authService
      .updateUser({
        displayName: this.editForm.displayName,
        profileImage: this.editForm.profileImage,
        bannerImage: this.editForm.bannerImage,
      })
      .subscribe({
        next: (updated) => {
          this.user = {
            ...updated,
            follower_count: this.user?.follower_count,
            following_count: this.user?.following_count,
          };
          this.closeEditModal();
          this.toastService.success('Profile updated successfully.');
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.error('Failed to update profile.');
          this.closeEditModal();
        },
      });
  }

  async deleteAccount() {
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to permanently delete your account? All your posts, replies, and data will be removed. This cannot be undone.',
      'Delete Account'
    );
    if (!confirmed) return;

    this.authService.deleteAccount().subscribe({
      next: () => {
        this.toastService.success('Account deleted successfully.');
        this.router.navigate(['/auth']);
      },
      error: () => {
        this.toastService.error('Failed to delete account. Please try again.');
      },
    });
  }

  protected readonly length = length;
}
