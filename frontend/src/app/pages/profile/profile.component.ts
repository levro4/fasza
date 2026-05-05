import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostComponent, Post, User } from '../../components/post/post.component';
import { PostResponse, PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { UserResponse } from '../../services/post.service';

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

  activeTab = 'Posts';
  tabs = ['Posts', 'Replies', 'Reposts', 'Media', 'Likes'];

  // Edit Profile Modal állapotok
  isEditModalOpen = false;
  editForm = {
    displayName: '',
    profileImage: '',
    bannerImage: '',
  };

  user: UserResponse | null = null;
  postList: PostResponse[] | undefined;

  ngOnInit(): void {
    this.authService.getLoggedInUser().subscribe((user) => {
      this.user = user;
    });
  }

  get posts(): PostResponse[] {
    this.postService.getPosts().subscribe(value => {
    this.postList =  value.filter(p => [1, 2, 3].includes(p.original_post_id!));
    });
    return (this.postList) ? this.postList : [];
  }

  get activeTabIndex(): number {
    return this.tabs.indexOf(this.activeTab);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // --- Modal Logika ---

  openEditModal() {
    if (!this.user) return;
    this.editForm = {
      displayName: this.user.username,
      profileImage: this.user.profileImage,
      bannerImage: this.user.bannerImage,
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  saveProfile() {
    if (!this.user) return;
    this.user.username = this.editForm.displayName;
    this.user.profileImage = this.editForm.profileImage;
    this.user.bannerImage = this.editForm.bannerImage;

    this.closeEditModal();
  }
}
