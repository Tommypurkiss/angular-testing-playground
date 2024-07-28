import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { UserService } from '../services/user/user.service';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth = getAuth();
  user$: Observable<User | null>;
    recaptchaVerifier: RecaptchaVerifier | undefined;
    confirmationResult: ConfirmationResult | undefined;

  constructor(
    private userService: UserService,
    private router: Router,

  ) {
    this.user$ = new Observable<User | null>((observer) => {
      const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
        if (user) {
        //   console.log('User is signed in', user.uid);
          const userData = await this.userService.getUser(user.uid);
          observer.next(userData);
        } else {
        //   console.log('User is signed out');
          observer.next(null);
        }
      });
      return () => unsubscribe();
    });
  }

  get windowRef(){
    return window
}

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  registerWithEmailAndPassword(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        let userData: User = {
          email: '',
          uid: user.uid
        };
        if (user.email) userData.email = user.email;
        if (user.displayName) userData.displayName = user.displayName;
        await this.userService.createUser(userData);
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  }

  loginWithEmailAndPassword(email: string, password: string) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // console.log('User logged in successfully.', userCredential.user.uid);
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  }


  loginWithPhoneNumber(phoneNumber: string) {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha', {
        callback: (response: any) => {
          console.log('reCAPTCHA solved, allow signInWithPhoneNumber.', response);
          this.onMobileSignInSubmit(phoneNumber);
        }
      });
      this.recaptchaVerifier.render().then(widgetId => {
        console.log('reCAPTCHA rendered with widget ID:', widgetId);
      });
    } else {
      this.onMobileSignInSubmit(phoneNumber);
    }
  }

  onMobileSignInSubmit(phoneNumber: string) {
    if (!this.recaptchaVerifier) {
      console.error('reCAPTCHA verifier is not initialized');
      return;
    }

    signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
      .then((confirmationResult) => {
        console.log('SMS sent', confirmationResult);
        if(confirmationResult) {
            this.recaptchaVerifier?.clear();
            this.confirmationResult = confirmationResult;
        }
      }).catch((error) => {
        console.log('Error sending SMS:', error);
      });
  }

  confirmMobileSignIn(verificationCode: string) {
    if (!this.confirmationResult) {
      console.error('Confirmation result is not initialized');
      return;
    }

    this.confirmationResult.confirm(verificationCode).then((result) => {
        // User signed in successfully.
        console.log('User signed in successfully.', result);
        const user = result.user;
        console.log('user', user)
        // ...
      }).catch((error) => {
        console.log('confirm error', error)
        // User couldn't sign in (bad verification code?)
        // ...
      });
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        // console.log('User logged out successfully.');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.log('Error logging out:', error);
      });
  }
}
