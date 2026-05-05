import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';

export interface Post {
  id: number;
  content: string;
  timestamp: string;
  isBookmarked?: boolean;
  hashtags?: string[];
  likes?: number;
  isLiked?: boolean;
  reposts?: number;
  isReposted?: boolean;
  views?: number;
}

export interface User {
  displayName: string;
  username: string;
  profileImage: string;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  @Input() user!: User;
  @Input() isThreadLineVisible = false;
  @Input() isClickable = true;

  @Output() postClicked = new EventEmitter<number>();

  commentCount = 0;
  private postService = inject(PostService);

  // Kommentelés (Reply) modal állapotok
  isReplyModalOpen = false;
  replyContent = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Betöltjük, hogy hány komment van ehhez a poszthoz (mock adatbázisból)
    this.commentCount = this.postService.getCommentsForPost(this.post.id).length;

    // Kezdeti értékek, ha nincsenek megadva (Szimuláljuk, mintha jönnének a backendről)
    if (this.post.likes === undefined) {
      this.post.likes = Math.floor(Math.random() * 50);
    }
    if (this.post.reposts === undefined) {
      this.post.reposts = Math.floor(Math.random() * 20);
    }
    if (this.post.views === undefined) {
      this.post.views = Math.floor(Math.random() * 500) + 100; // Alapértelmezett megtekintések
    }
  }

  toggleBookmark(event: Event) {
    event.stopPropagation();
    this.post.isBookmarked = !this.post.isBookmarked;
  }

  toggleLike(event: Event) {
    event.stopPropagation();
    if (this.post.isLiked) {
      this.post.isLiked = false;
      this.post.likes = (this.post.likes || 1) - 1;
    } else {
      this.post.isLiked = true;
      this.post.likes = (this.post.likes || 0) + 1;
    }
  }

  toggleRepost(event: Event) {
    event.stopPropagation();
    if (this.post.isReposted) {
      this.post.isReposted = false;
      this.post.reposts = (this.post.reposts || 1) - 1;
    } else {
      this.post.isReposted = true;
      this.post.reposts = (this.post.reposts || 0) + 1;
    }
  }

  onPostClick() {
    if (this.isClickable) {
      // Megtekintés növelése kattintásra
      this.post.views = (this.post.views || 0) + 1;

      this.postClicked.emit(this.post.id);
      this.router.navigate(['/post', this.post.id]);
    }
  }

  onActionClick(event: Event) {
    event.stopPropagation();
  }

  // --- Kommentelés Modál ---
  openReplyModal(event: Event) {
    event.stopPropagation();
    this.isReplyModalOpen = true;
  }

  closeReplyModal() {
    this.isReplyModalOpen = false;
    this.replyContent = '';
  }

  submitReply() {
    const trimmed = this.replyContent.trim();
    if (trimmed) {
      console.log(`Submitting reply to post ${this.post.id}:`, trimmed);

      // Megnöveljük lokálisan is a számlálót, hogy rögtön látszódjon a frissülés
      this.commentCount++;

      // Itt egy valós app hívná a Backend API-t.
      this.closeReplyModal();
    }
  }

  get formattedContent(): string {
    if (!this.post.content) return '';
    const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
    return this.post.content.replace(hashtagRegex, '<span class="hashtag-link">$1</span>');
  }
}
