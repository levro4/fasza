import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostComponent } from '../../components/post/post.component';
import { PostService, PostWithUser } from '../../services/post.service';

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

  get bookmarkedPosts(): PostWithUser[] {
    return this.postService.getPosts().filter(p => p.post.isBookmarked);
  }
}
