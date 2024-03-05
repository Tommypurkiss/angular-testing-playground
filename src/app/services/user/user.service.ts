import { Injectable, inject } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../../interfaces/user';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore)

  constructor() {}

  async createUser(userData: User) {
    // this.angularFirestore.collection('users').doc(userData.uid).set(userData)
    //   .then(() => {
    //     console.log('User data added successfully:', userData);
    //   })
    //   .catch((error) => {
    //     console.error('Error adding user data:', error);
    //   });
    const userCollection = collection(this.firestore, 'users')
    const result = await addDoc(userCollection, userData)
    console.log('User data added successfully:', result);

  }

  getUser() {
    // Add implementation to get user data if needed
  }
}
