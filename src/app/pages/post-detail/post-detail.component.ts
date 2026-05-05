import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { PostService, PostWithUser } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  mainPost: PostWithUser | null = null;
  comments: PostWithUser[] = [];

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
    const foundPost = this.postService.getPostById(postId);
    if (foundPost) {
      this.mainPost = foundPost;
      this.comments = this.postService.getCommentsForPost(postId);
    } else {
      // Poszt nem található, visszairányítás
      this.router.navigate(['/home']);
    }
  }
}
