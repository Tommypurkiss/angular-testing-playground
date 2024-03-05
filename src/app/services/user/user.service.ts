import { Injectable, inject } from '@angular/core';
import { User } from '../../interfaces/user';
import { Firestore, collection, setDoc, doc, getDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore)

  constructor() {}

  async createUser(userData: User) {
    const userCollection = collection(this.firestore, 'users')

    // Allows us to set the document id to the user's uid - doesn't return a value
    await setDoc(doc(userCollection, userData.uid), userData)
    console.log('User data added successfully');

  }

  async getUser(userId: string): Promise<User> {
    // Add implementation to get user data if needed
    const userCollection = collection(this.firestore, 'users')
    const userDoc = (await getDoc(doc(userCollection, userId))).data() as User
    console.log('User data retrieved successfully', userDoc);
    return userDoc
  }
}
