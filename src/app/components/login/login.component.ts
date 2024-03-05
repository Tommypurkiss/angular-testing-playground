import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { modules } from '../../modules/modules';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [modules],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

    loginEmail: string = ''
    loginPassword: string = ''


    constructor(
        private authService: AuthService
    ) {}


    signInEmailAndPassword() {
        this.authService.loginWithEmailAndPassword(this.loginEmail, this.loginPassword)
    }


}
