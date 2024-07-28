import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, PhoneAuthProvider, UserCredential } from 'firebase/auth';
import { UserService } from '../services/user/user.service';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { Observable, combineLatest, defer, from, map, of, switchMap, take, tap } from 'rxjs';

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
          const userData = await this.userService.getUser(user.uid);
          observer.next(userData);
        } else {
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
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  }

  loginWithPhoneNumber$(phoneNumber: string):Observable<boolean> {
    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha', {});

    return combineLatest(([this.recaptchaVerifier.verify()])).pipe(
        map((recaptchaResult) => !!recaptchaResult.length ), // I dont think this is needed
        switchMap(() => this.onMobileSignInSubmit$(phoneNumber))
    )
  }

  onMobileSignInSubmit$(phoneNumber: string): Observable<boolean> {
    return defer(() => {
        if (!this.recaptchaVerifier) {
            return of(false)
          }

        return signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
        .then((confirmationResult) => {
          if(confirmationResult) {
              this.recaptchaVerifier?.clear();
              this.confirmationResult = confirmationResult;
          }
          return true
        }).catch((error) => {
          console.error(error)
          return false
        });
    })
  }

  confirmMobileSignIn(verificationCode: string, phoneNumber: string) {
    if (!this.confirmationResult) {
      return;
    }

    this.confirmationResult.confirm(verificationCode).then((result) => {
        console.log('User signed in successfully.', result);
        this.checkIfUserExists(result, phoneNumber)

        // ...
      }).catch((error) => {
        console.log('confirm error', error)
        // User couldn't sign in (bad verification code?)
        // ...
      });

      this.router.navigate(['/dashboard']);
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

  private async checkIfUserExists(userCredential: UserCredential, phoneNumber: string) {

    const result = await this.userService.getUser(userCredential.user.uid)

    if(!result) {
        const userData: User = {
            displayName: '',
            email: '',
            uid: userCredential.user.uid,
            phoneNumber: phoneNumber
        }
        this.userService.createUser(userData)

    }
  }
}
