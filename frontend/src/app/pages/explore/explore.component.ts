import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { UserService } from '../../services/user.service';
import { Post, PostApiResponse } from '../../models/post.model';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private postService = inject(PostService);
  private cdr = inject(ChangeDetectorRef);

  posts: Post[] = [];
  loading = true;
  private feedSub?: Subscription;

  ngOnInit() {
    this.loadPosts();
    this.feedSub = this.postService.feedChanged$.subscribe(() => this.loadPosts());
  }

  ngOnDestroy() {
    this.feedSub?.unsubscribe();
  }

  loadPosts() {
    this.userService.getExploreFeed().subscribe({
      next: (data: PostApiResponse[]) => {
        this.posts = data.map(pr => this.mapApiResponseToPost(pr));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading explore posts', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPostDeleted(postId: number) {
    this.posts = this.posts.filter(p => p.id !== postId && p.original_post_id !== postId);
  }

  private mapApiResponseToPost(pr: PostApiResponse): Post {
    return {
      id: pr.id,
      content: pr.content,
      created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
      owner: {
        id: pr.owner?.id || 0,
        displayName: pr.owner?.displayName || pr.owner.username,
        username: `@${pr.owner?.username || 'unknown'}`,
        profileImage: pr.owner?.profileImage || 'https://i.pravatar.cc/150?u=' + (pr.owner?.id || 1),
      },
      owner_id: pr.owner_id,
      original_post_id: pr.original_post_id,
      original_post: pr.original_post ? this.mapApiResponseToPost(pr.original_post) : undefined,
      isBookmarked: false,
      hashtags: [],
      likes: pr.like_count ?? 0,
      isLiked: pr.is_liked ?? false,
      reposts: pr.repost_count ?? 0,
      isReposted: pr.is_reposted ?? false,
      views: 0,
      commentCount: 0,
    };
  }
}
