import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PostComponent } from '../post/post.component';
import { Post, PostApiResponse } from '../../models/post.model';
import { ReplyWithContext } from '../../models/comment.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-reply-thread',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './reply-thread.component.html',
  styleUrls: ['./reply-thread.component.css'],
})
export class ReplyThreadComponent {
  @Input() data!: ReplyWithContext;

  constructor(private router: Router) {}

  get originalPost(): Post {
    return this.mapPost(this.data.original_post);
  }

  private mapPost(pr: PostApiResponse): Post {
    return {
      id: pr.id,
      content: pr.content,
      created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
      owner: this.mapUser(pr.owner),
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

  get replyPost(): Post {
    const c = this.data.reply;
    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at ? new Date(c.created_at).toLocaleString() : '',
      owner: this.mapUser(c.author),
      owner_id: c.user_id,
      likes: c.like_count ?? 0,
      isLiked: c.is_liked ?? false,
      reposts: 0,
      isReposted: false,
      isBookmarked: false,
      hashtags: [],
      views: 0,
      commentCount: 0,
    };
  }

  navigateToOriginalPost() {
    this.router.navigate(['/post', this.data.original_post.id]);
  }

  private mapUser(user: User | undefined): User {
    return {
      id: user?.id || 0,
      displayName: user?.displayName || user?.username || 'Unknown',
      username: `@${user?.username || 'unknown'}`,
      profileImage: user?.profileImage || 'https://i.pravatar.cc/150?u=' + (user?.id || 1),
    };
  }
}
