import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
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
      const newPostData = {
        content: trimmedContent,
        hashtags: uniqueHashtags
      };

      console.log('Sending to database:', newPostData);

      // Valódi alkalmazásban itt hívnánk meg a Service "createPost" függvényét:
      // this.postService.createNewPost(newPostData);

      this.closePostModal();
    }
  }
}
