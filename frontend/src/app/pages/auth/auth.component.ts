import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  public login() {
    if (!this.username || !this.password) return;

    // OAuth2PasswordRequestForm expects form-data
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
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        alert(err.error?.detail || 'Login failed');
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
        // After registration, automatically log them in or switch to login mode
        this.isLoginMode = true;
        this.login();
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert(err.error?.detail || 'Registration failed');
      }
    });
  }
}
