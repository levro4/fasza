import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostComponent } from '../../components/post/post.component';
import { PostService, PostWithUser } from '../../services/post.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PostComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  pageTitle = 'Profile';
  private postService = inject(PostService);

  activeTab = 'Posts';
  tabs = ['Posts', 'Replies', 'Reposts', 'Media', 'Likes'];

  // Edit Profile Modal állapotok
  isEditModalOpen = false;
  editForm = {
    displayName: '',
    profileImage: '',
    bannerImage: ''
  };

  // Ideiglenes statikus adatok a megjelenítéshez
  user = {
    displayName: 'John Doe',
    username: '@johndoe',
    joinDate: 'March 2024',
    followingCount: 154,
    followersCount: 1024,
    profileImage: 'https://i.pravatar.cc/150?img=11',
    bannerImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80'
  };

  get posts(): PostWithUser[] {
    return this.postService.getPosts().filter(p => [1, 2, 3].includes(p.post.id));
  }

  get activeTabIndex(): number {
    return this.tabs.indexOf(this.activeTab);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // --- Modal Logika ---

  openEditModal() {
    // Betöltjük a jelenlegi adatokat a formba
    this.editForm = {
      displayName: this.user.displayName,
      profileImage: this.user.profileImage,
      bannerImage: this.user.bannerImage
    };
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  saveProfile() {
    // Elmentjük a form adatait a user objektumba
    this.user.displayName = this.editForm.displayName;
    this.user.profileImage = this.editForm.profileImage;
    this.user.bannerImage = this.editForm.bannerImage;

    this.closeEditModal();
  }
}
