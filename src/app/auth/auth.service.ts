import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
