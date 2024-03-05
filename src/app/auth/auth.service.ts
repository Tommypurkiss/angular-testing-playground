import { Injectable } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    // user$: Observable<any>

  constructor(
  ) {
    this.getUser()
  }

  getUser() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(user)
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log('uid', uid)
        // ...
    } else {
        // User is signed out
        // ...
    }
    });
  }
}
