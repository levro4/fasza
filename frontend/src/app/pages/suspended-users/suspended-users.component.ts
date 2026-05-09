import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-suspended-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suspended-users.component.html',
  styleUrls: ['./suspended-users.component.css'],
})
export class SuspendedUsersComponent implements OnInit {
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  users: User[] = [];
  loading = true;
  defaultProfilePictureUrl = environment.defaultProfilePictureUrl;

  goBack() { window.history.back(); }

  ngOnInit() {
    this.userService.getSuspendedUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/home']);
      },
    });
  }

  goToProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  async unsuspend(user: User, event: Event) {
    event.stopPropagation();
    const confirmed = await this.confirmDialog.confirm(
      `Unsuspend @${user.username}? They will regain access to the platform.`,
      'Unsuspend'
    );
    if (!confirmed) return;

    this.userService.suspendUser(user.id!).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.toastService.success(`@${user.username} has been unsuspended.`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to unsuspend user.');
      },
    });
  }
}
