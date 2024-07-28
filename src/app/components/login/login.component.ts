import { Component, HostBinding } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { modules } from '../../modules/modules';
import { take, tap } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [modules],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
    @HostBinding('class') class = 'h-full flex flex-col flex-1';

    // Login with email
    loginEmail: string = ''
    loginPassword: string = ''

    // Login with phone number
    loginPhoneNumber: string = ''
    loginPhoneNumberCode: string = ''
    loginWithNumberSmsSent: boolean = false

    constructor(
        private authService: AuthService
    ) {}

    signInEmailAndPassword(): void {
        this.authService.loginWithEmailAndPassword(this.loginEmail, this.loginPassword)
    }

    signInWithPhoneNumber(): void {
        this.authService.loginWithPhoneNumber$(this.loginPhoneNumber)
        .pipe(
            take(1),
            tap((smsResult: boolean) => this.loginWithNumberSmsSent = smsResult)
        ).subscribe()
    }

    confirmSignInWithPhoneNumber(): void {
        this.authService.confirmMobileSignIn(this.loginPhoneNumberCode, this.loginPhoneNumber)
    }


}
