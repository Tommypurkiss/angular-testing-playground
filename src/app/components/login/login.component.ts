import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

    loginEmail: string = ''
    loginPassword: string = ''

    registerEmail: string = ''
    registerPassword: string = ''

    constructor(
        private authService: AuthService
    ) {}

    registerWithEmailAndPassword() {
        this.authService.registerWithEmailAndPassword(this.registerEmail, this.registerPassword)
    }

    signInEmailAndPassword() {
        this.authService.loginWithEmailAndPassword(this.loginEmail, this.loginPassword)
    }

    onSignOut() {
        this.authService.logout()
    }


}
