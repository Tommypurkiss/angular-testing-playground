import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
    isEmailError = false
    loginEmail: string = ''
    loginPassword: string = ''

    registerEmail: string = ''
    registerPassword: string = ''

    constructor() {}

    registerWithEmailAndPassword() {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, this.registerEmail, this.registerPassword)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            console.log('user', user)
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(
                [errorCode, errorMessage]
            )
        });
    }

    signInEmailAndPassword() {
        const auth = getAuth();
        console.log('auth', auth)
        signInWithEmailAndPassword(auth, this.loginEmail, this.loginPassword)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('user', user)

            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(
                [errorCode, errorMessage]
            )
        });
    }

    onSignOut() {
        const auth = getAuth();
        signOut(auth).then(() => {
        // Sign-out successful.
        console.log('Sign-out successful.')
        }).catch((error) => {
        // An error happened.
        console.log('error signing out', error)
        });
    }

    onGetAuth() {
        const auth = getAuth();
        console.log('auth', auth)
    }

    signInWithEmail() {
        console.log('userEmailInput' , this.loginEmail)
        // if(!this.isEmailValid) {
        //     this.isEmailError = true
        //     return
        // }

    }

    // isEmailValid(): boolean {
    //     return this.userEmailInput.includes('@')
    // }

}
