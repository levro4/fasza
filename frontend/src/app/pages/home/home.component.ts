import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { Post, PostApiResponse } from '../../models/post.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  pageTitle = 'Home';
  posts: { post: Post, user: User }[] = [];
  isLoading = true;
  private postCreatedSubscription!: Subscription;

  constructor(
    private postService: PostService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Keep it simple. Let angular detect changes naturally on load.
    this.loadPosts();
    this.postCreatedSubscription = this.postService.postCreated$.subscribe(() => {
      this.loadPosts();
    });
  }

  ngOnDestroy(): void {
    if (this.postCreatedSubscription) {
      this.postCreatedSubscription.unsubscribe();
    }
  }

  loadPosts(): void {
    // If the component is already checked, changing this synchronously inside the observable
    // subscription might cause NG0100. Using setTimeout defers the update slightly, avoiding it.
    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges();
    }, 0);

    const token = localStorage.getItem('access_token');
    const feed = token ? this.postService.getFeed() : this.postService.getPosts();
    feed.subscribe({
      next: (data: PostApiResponse[]) => {
        // Deferring this as well ensures we don't conflict with any ongoing change detection cycle
        setTimeout(() => {
          this.posts = data.map(pr => this.mapPostToPostView(pr));
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        setTimeout(() => {
          console.error('Error loading posts', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  private mapPostToPostView(pr: PostApiResponse): { post: Post, user: User } {
    const post = this.mapApiResponseToPost(pr);
    return { post, user: post.owner };
  }

  private mapApiResponseToPost(pr: PostApiResponse): Post {
    const owner = this.mapUserResponse(pr.owner);
    return {
      id: pr.id,
      content: pr.content,
      created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
      owner,
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
      commentCount: 0
    };
  }

  private mapUserResponse(user: User | undefined): User {
    return {
      id: user?.id || 0,
      displayName: user?.displayName || user?.username || 'Unknown',
      username: `@${user?.username || 'unknown'}`,
      profileImage: user?.profileImage || 'https://i.pravatar.cc/150?u=' + (user?.id || 1)
    };
  }

  onPostClicked(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  onPostDeleted(postId: number): void {
    this.posts = this.posts.filter(item => item.post.id !== postId);
  }
}
