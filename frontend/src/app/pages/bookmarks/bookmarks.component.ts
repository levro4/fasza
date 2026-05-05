import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent, Post, User } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.css'
})
export class BookmarksComponent {
  pageTitle = 'Bookmarks';
  private postService = inject(PostService);

  get bookmarkedPosts(): { post: Post, user: User }[] {
    // return this.postService.getPosts().filter(p => p.post.isBookmarked);
    return [];
  }
}
