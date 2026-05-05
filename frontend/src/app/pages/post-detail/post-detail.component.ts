import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent, Post, User } from '../../components/post/post.component';
import { PostService, PostResponse, CommentResponse } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  mainPost: { post: Post, user: User } | null = null;
  comments: { post: Post, user: User }[] = [];

  private postService = inject(PostService);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const postId = Number(params.get('id'));
      if (postId) {
        this.loadPostData(postId);
      }
    });
  }

  goBack() {
    window.history.back();
  }

  loadPostData(postId: number) {
    this.postService.getPostById(postId).subscribe({
      next: (foundPost) => {
        this.mainPost = this.mapPostResponse(foundPost);
        this.loadComments(postId);
      },
      error: () => {
        // Poszt nem található, visszairányítás
        this.router.navigate(['/home']);
      }
    });
  }

  loadComments(postId: number) {
    this.postService.getCommentsForPost(postId).subscribe({
      next: (comments) => {
        this.comments = comments.map(c => this.mapCommentResponse(c));
      }
    });
  }

  private mapPostResponse(pr: PostResponse): { post: Post, user: User } {
    return {
      post: {
        id: pr.id,
        content: pr.content,
        timestamp: new Date(pr.created_at).toLocaleString(),
        isBookmarked: false,
        hashtags: [],
        likes: 0,
        isLiked: false,
        reposts: 0,
        isReposted: false,
        views: 0
      },
      user: {
        displayName: pr.owner.username,
        username: `@${pr.owner.username}`,
        profileImage: 'https://i.pravatar.cc/150?u=' + pr.owner.id
      }
    };
  }

  private mapCommentResponse(cr: CommentResponse): { post: Post, user: User } {
    return {
      post: {
        id: cr.id,
        content: cr.content,
        timestamp: new Date(cr.created_at).toLocaleString(),
        isBookmarked: false,
        hashtags: [],
        likes: 0,
        isLiked: false,
        reposts: 0,
        isReposted: false,
        views: 0
      },
      user: {
        displayName: cr.author.username,
        username: `@${cr.author.username}`,
        profileImage: 'https://i.pravatar.cc/150?u=' + cr.author.id
      }
    };
  }
}
