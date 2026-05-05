import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isPostModalOpen = false;
  postContent = '';

  private postService = inject(PostService);

  openPostModal() {
    this.isPostModalOpen = true;
  }

  closePostModal() {
    this.isPostModalOpen = false;
    this.postContent = ''; // Tartalom ürítése bezáráskor
  }

  onPostContentChange(event: Event) {
    this.postContent = (event.target as HTMLTextAreaElement).value;
  }

  submitPost() {
    const trimmedContent = this.postContent.trim();
    if (trimmedContent) {
      // 1. Hashtagek kigyűjtése
      const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
      const matchedHashtags = trimmedContent.match(hashtagRegex) || [];

      // Egyedi hashtagek kiválasztása (ha valaki kétszer írja be ugyanazt)
      const uniqueHashtags = [...new Set(matchedHashtags)];

      // 2. Poszt adatbázis (Service) számára átadandó objektum előkészítése
      // (Backendünk jelenleg egy 'content' stringet vár, ami tartalmazhat hashtageket is)
      const newPostData = {
        content: trimmedContent,
      };
      console.log('Sending to database:', newPostData);

      // Valódi alkalmazásban itt hívnánk meg a Service "createPost" függvényét:
      this.postService.createPost(trimmedContent).subscribe({
        next: (post) => {
          console.log('Post created successfully:', post);
          this.closePostModal();
          // Ideally, we might want to refresh the feed here or use an observable subject
        },
        error: (err) => {
          console.error('Failed to create post:', err);
        },
      });
    }
  }
  logout() {
    localStorage.removeItem('access_token');
    window.location.reload();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
}

