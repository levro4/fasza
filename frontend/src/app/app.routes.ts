import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AuthComponent } from './pages/auth/auth.component';
import { PostDetailComponent } from './pages/post-detail/post-detail.component';
import { SuspendedUsersComponent } from './pages/suspended-users/suspended-users.component';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'post/:id', component: PostDetailComponent },
  { path: 'admin/suspended-users', component: SuspendedUsersComponent },
  { path: '**', redirectTo: '/home' }
];
