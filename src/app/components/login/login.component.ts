import { Component, HostBinding } from '@angular/core';
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
    @HostBinding('class') class = 'h-full flex flex-col flex-1';


    loginEmail: string = ''
    loginPassword: string = ''

    loginPhoneNumber: string = ''
    loginPhoneNumberCode: string = ''

    loginWithNumberSent: boolean = false

    constructor(
        private authService: AuthService
    ) {}


    signInEmailAndPassword() {
        this.authService.loginWithEmailAndPassword(this.loginEmail, this.loginPassword)
    }

    signInWithPhoneNumber() {
        console.log('signInWithPhoneNumber', this.loginPhoneNumber)
        this.authService.loginWithPhoneNumber(this.loginPhoneNumber)
        this.loginWithNumberSent = true
    }

    confirmSignInWithPhoneNumber() {
        console.log('confirmMobileSignIn', this.loginPhoneNumberCode)
        this.authService.confirmMobileSignIn(this.loginPhoneNumberCode)
    }


}
