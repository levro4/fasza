import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  isLoginMode = true;
  username = '';
  email = '';
  password = '';

  private toastService = inject(ToastService);

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  public login(isAfterRegister = false) {
    if (!this.username || !this.password) return;

    const body = new URLSearchParams();
    body.set('username', this.username);
    body.set('password', this.password);

    const options = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    this.http.post<any>(`${environment.apiUrl}/login`, body.toString(), options).subscribe({
      next: (response) => {
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.authService.refreshCurrentUser();
          const message = isAfterRegister
            ? `Welcome, @${this.username}! Your account has been created.`
            : `Welcome back, @${this.username}!`;
          this.toastService.success(message);
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.toastService.error(err.error?.detail || 'Login failed. Please try again.');
      }
    });
  }

  public register() {
    if (!this.username || !this.email || !this.password) return;

    const userData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    this.http.post<any>(`${environment.apiUrl}/register`, userData).subscribe({
      next: () => {
        this.isLoginMode = true;
        this.login(true);
      },
      error: (err) => {
        console.error('Registration failed', err);
        this.toastService.error(err.error?.detail || 'Registration failed. Please try again.');
      }
    });
  }
}
