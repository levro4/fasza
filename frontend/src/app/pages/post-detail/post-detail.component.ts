import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { Post, PostApiResponse } from '../../models/post.model';
import { User } from '../../models/user.model';
import { CommentApiResponse } from '../../models/comment.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  mainPost!: Post;
  comments: CommentApiResponse[] = [];
  private feedSub?: Subscription;

  private postService = inject(PostService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const postId = Number(params.get('id'));
      if (postId) {
        this.loadPostData(postId);
      }
    });
    this.feedSub = this.postService.feedChanged$.subscribe(() => {
      if (this.mainPost?.id) {
        this.loadComments(this.mainPost.id);
      }
    });
  }

  ngOnDestroy() {
    this.feedSub?.unsubscribe();
  }

  goBack() {
    window.history.back();
  }

  loadPostData(postId: number) {
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.mainPost = this.mapPostResponse(post);
        this.loadComments(postId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('POST ERROR:', err);
        this.router.navigate(['/home']);
      },
    });
  }

  loadComments(postId: number) {
    this.postService.getCommentsForPost(postId).subscribe({
      next: (comments) => {
        this.comments = comments.map(c => {
          // Create a "Post-like" object from the comment data to render in app-post
          const postFromComment: Post = {
            id: c.id,
            content: c.content,
            created_at: c.created_at ? new Date(c.created_at).toLocaleString() : '',
            owner: this.mapUserResponse(c.author),
            owner_id: c.user_id,
            isBookmarked: false,
            hashtags: [],
            likes: c.like_count ?? 0,
            isLiked: c.is_liked ?? false,
            reposts: 0,
            isReposted: false,
            views: 0,
            commentCount: 0
          };

          return {
            ...c,
            author: this.mapUserResponse(c.author),
            post: postFromComment,
          };
        });
        this.mainPost.commentCount = comments.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('COMMENTS ERROR:', err);
      },
    });
  }

  private mapPostResponse(pr: PostApiResponse): Post {
    return {
      id: pr.id,
      content: pr.content,
      created_at: pr.created_at ? new Date(pr.created_at).toLocaleString() : '',
      owner: this.mapUserResponse(pr.owner),
      owner_id: pr.owner_id,
      original_post_id: pr.original_post_id,
      original_post: pr.original_post ? this.mapPostResponse(pr.original_post) : undefined,
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
}
