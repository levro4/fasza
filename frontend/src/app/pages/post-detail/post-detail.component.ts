import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit {
  mainPost!: Post;
  comments: Comment[] = [];

  private postService = inject(PostService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
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
    console.log('Loading post:', postId);

    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        console.log('POST RECEIVED:', post);

        this.mainPost = post;

        this.loadComments(postId);
      },
      error: (err) => {
        console.error('POST ERROR:', err);
        this.router.navigate(['/home']);
      },
    });
  }

  loadComments(postId: number) {
    console.log('Loading comments...');

    this.postService.getCommentsForPost(postId).subscribe({
      next: (comments) => {
        console.log('COMMENTS RECEIVED:', comments);

        this.comments = comments;
      },
      error: (err) => {
        console.error('COMMENTS ERROR:', err);
      },
    });
  }
}
