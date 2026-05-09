import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { UserService } from '../../services/user.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnChanges, OnDestroy {
  @Input() post!: Post;
  @Input() isThreadLineVisible = false;
  @Input() isClickable = true;
  @Input() isComment = false;

  @Output() postClicked = new EventEmitter<number>();
  @Output() postDeleted = new EventEmitter<number>();

  private cdr = inject(ChangeDetectorRef);
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private userService = inject(UserService);
  private sanitizer = inject(DomSanitizer);

  commentCount = 0;
  isReplyModalOpen = false;
  isOptionsOpen = false;
  private userSub?: Subscription;
  replyContent = '';
  defaultProfilePictureUrl = environment.defaultProfilePictureUrl;
  user: User | null = null;

  constructor(private router: Router, private authService: AuthService) {
    this.post = { ...this.post, likes: 0, reposts: 0, views: 0, commentCount: 0 };
  }

  ngOnInit() {
    this.userSub = this.authService.getOptionalUser().subscribe((user) => {
      this.user = user;
      this.cdr.detectChanges();
    });
    if (this.post?.id) {
      this.fetchCommentCount();
    }
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] && this.post?.id) {
      this.fetchCommentCount();
    }
  }

  private fetchCommentCount() {
    this.postService.getCommentsForPost(this.ep.id).subscribe({
      next: (comments) => {
        this.commentCount = comments.length;
        this.cdr.detectChanges();
      },
    });
  }

  get isRepost(): boolean {
    return !!(this.post.original_post_id && this.post.original_post);
  }

  get ep(): Post {
    return this.isRepost ? this.post.original_post! : this.post;
  }

  get repostLabel(): string {
    return this.user && this.post.owner_id === this.user.id
      ? 'You reposted'
      : `${this.post.owner.displayName} reposted`;
  }

  get canDelete(): boolean {
    return !!(this.user && (this.user.role === 'admin' || this.user.id === this.post.owner_id));
  }

  @HostListener('document:click')
  closeOptions() {
    if (this.isOptionsOpen) {
      this.isOptionsOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleOptions(event: Event) {
    event.stopPropagation();
    if (!this.canDelete) return;
    this.isOptionsOpen = !this.isOptionsOpen;
  }

  async deletePost(event: Event) {
    event.stopPropagation();
    this.isOptionsOpen = false;

    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.',
      'Delete'
    );
    if (!confirmed) return;

    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.toastService.success('Post deleted successfully.');
        this.postDeleted.emit(this.post.id);
        this.postService.notifyFeedChanged();
      },
      error: () => {
        this.toastService.error('Failed to delete post. Please try again.');
      },
    });
  }

  toggleBookmark(event: Event) {
    event.stopPropagation();
    if (!this.user) return;
    this.post.isBookmarked = !this.post.isBookmarked;
  }

  toggleLike(event: Event) {
    event.stopPropagation();
    if (!this.user) return;
    const target = this.ep;
    const prevLiked = target.isLiked;
    const prevLikes = target.likes || 0;
    target.isLiked = !prevLiked;
    target.likes = prevLiked ? prevLikes - 1 : prevLikes + 1;

    const request = this.isComment
      ? this.postService.likeComment(target.id)
      : this.postService.likePost(target.id);

    request.subscribe({
      next: (res) => {
        if (res?.is_liked !== undefined) {
          target.isLiked = res.is_liked;
          target.likes = res.like_count;
        }
      },
      error: () => {
        target.isLiked = prevLiked;
        target.likes = prevLikes;
      },
    });
  }

  toggleRepost(event: Event) {
    event.stopPropagation();
    if (!this.user) return;
    const target = this.ep;
    const prevReposted = target.isReposted;
    const prevReposts = target.reposts || 0;
    target.isReposted = !prevReposted;
    target.reposts = prevReposted ? prevReposts - 1 : prevReposts + 1;

    this.postService.retweetPost(target.id).subscribe({
      next: (res) => {
        target.isReposted = res.is_reposted;
        target.reposts = res.repost_count;
        if (res.is_reposted) {
          this.toastService.success('Post reposted!');
        } else {
          this.toastService.info('Repost removed.');
        }
        this.postService.notifyFeedChanged();
      },
      error: () => {
        target.isReposted = prevReposted;
        target.reposts = prevReposts;
        this.toastService.error('Failed to repost. Please try again.');
      },
    });
  }

  onPostClick() {
    if (this.isClickable) {
      this.ep.views = (this.ep.views || 0) + 1;
      this.postClicked.emit(this.ep.id);
      this.router.navigate(['/post', this.ep.id]);
    }
  }

  onActionClick(event: Event) {
    event.stopPropagation();
  }

  onUserClick(event: Event) {
    event.stopPropagation();
    const id = this.ep.owner_id || this.ep.owner?.id;
    if (id) {
      this.router.navigate(['/profile', id]);
    }
  }

  openReplyModal(event: Event) {
    event.stopPropagation();
    if (!this.user) return;
    this.isReplyModalOpen = true;
  }

  closeReplyModal() {
    this.isReplyModalOpen = false;
    this.replyContent = '';
  }

  submitReply() {
    const trimmed = this.replyContent.trim();
    if (trimmed) {
      this.postService.createComment(this.post.id, trimmed).subscribe({
        next: () => {
          this.fetchCommentCount();
          this.closeReplyModal();
          this.toastService.success('Reply posted!');
          this.postService.notifyFeedChanged();
        },
        error: () => {
          this.toastService.error('Failed to post reply. Please try again.');
        },
      });
    }
  }

  onContentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('mention-link')) {
      event.stopPropagation();
      const username = target.dataset['username'];
      if (username) {
        this.userService.getUserByUsername(username).subscribe({
          next: (user) => this.router.navigate(['/profile', user.id]),
          error: () => {},
        });
      }
    }
  }

  get formattedContent(): SafeHtml {
    if (!this.ep.content) return '';
    const escaped = this.ep.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
    let content = escaped.replace(hashtagRegex, '<span class="hashtag-link">$1</span>');
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    content = content.replace(mentionRegex, (_, username) =>
      `<span class="mention-link" data-username="${username}">@${username}</span>`
    );
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
