import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { BookmarksComponent } from './pages/bookmarks/bookmarks.component';
import { AuthComponent } from './pages/auth/auth.component';
import { PostDetailComponent } from './pages/post-detail/post-detail.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'bookmarks', component: BookmarksComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: '**', redirectTo: '/home' }
];
