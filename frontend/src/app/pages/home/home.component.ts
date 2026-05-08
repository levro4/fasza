import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  pageTitle = 'Home';
  posts: { post: Post, user: User }[] = [];
  isLoading = true; // Add a loading state

  constructor(private postService: PostService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.postService.getFeed().subscribe({
      next: (data: Post[]) => {
        this.posts = data.map(pr => this.mapPostResponse(pr));
        this.isLoading = false;
        this.cdr.detectChanges(); // Force view to update
      },
      error: (err) => {
        console.error('Error loading posts', err);
        this.isLoading = false;
        this.cdr.detectChanges(); // Force view to update
      }
    });
  }

  // Maps the backend response to the component's internal interfaces
  private mapPostResponse(pr: Post): { post: Post, user: User } {
    return {
      post: {
        id: pr.id,
        content: pr.content,
        created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
        owner: pr.owner,
        owner_id: pr.owner_id,
        isBookmarked: false,
        hashtags: [],
        likes: 0,
        isLiked: false,
        reposts: 0,
        isReposted: false,
        views: 0
      },
      user: {
        displayName: pr.owner?.username || 'Unknown',
        username: `@${pr.owner?.username || 'unknown'}`,
        profileImage: 'https://i.pravatar.cc/150?u=' + (pr.owner?.id || 1)
      }
    };
  }

  onPostClicked(postId: number): void {
    console.log(`Navigating to post ${postId}`);
  }
}
