import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PostComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  pageTitle = 'Profile';
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  activeTab = 'Posts';
  tabs = ['Posts', 'Replies', 'Reposts', 'Media', 'Likes'];

  isEditModalOpen = false;
  editForm = {
    displayName: '',
    profileImage: '',
    bannerImage: '',
  };

  user: User | null = null;
  posts: Post[] = [];

  ngOnInit(): void {
    this.authService.getLoggedInUser().subscribe((user) => {
      this.user = user;
      this.loadUserPosts();
      this.cdr.detectChanges();
    });
  }

  loadUserPosts(): void {
    if (!this.user) return;
    this.postService.getPosts().subscribe(allPosts => {
      this.posts = allPosts.filter(p => p.owner_id === this.user?.id);
      this.cdr.detectChanges();
    });
  }

  get activeTabIndex(): number {
    return this.tabs.indexOf(this.activeTab);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openEditModal() {
    if (!this.user) return;
    this.editForm = {
      displayName: this.user.displayName || this.user.username,
      profileImage: this.user.profileImage || '',
      bannerImage: this.user.bannerImage || '',
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  saveProfile() {
    if (!this.user) return;

    const updateData = {
      displayName: this.editForm.displayName,
      profileImage: this.editForm.profileImage,
      bannerImage: this.editForm.bannerImage
    };

    this.authService.updateUser(updateData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.closeEditModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating profile', err);
        this.closeEditModal();
      }
    });
  }
}
