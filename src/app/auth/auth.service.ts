import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { UserService } from '../services/user/user.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth = getAuth();

  constructor(private userService: UserService) {}

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
        console.log('User logged in:', userCredential.user);
      })
      .catch((error) => {
        console.log(error.code, error.message);
      });
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        console.log('User logged out successfully.');
      })
      .catch((error) => {
        console.log('Error logging out:', error);
      });
  }
}
