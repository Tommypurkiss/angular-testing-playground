import { Injectable, inject } from '@angular/core';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../interfaces/user';
import { combineLatest, filter, map } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { Firestore, addDoc, collection, doc } from '@angular/fire/firestore';
import { Todo } from '../../interfaces/todo';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  firestore = inject(Firestore)


  constructor(
    private authService: AuthService,
    private userService: UserService
  ) { }

  async addTodo(todoValue: string) {
    console.log('add todo')

    const todoData: Todo = { value: todoValue }

    const uid = getAuth().currentUser?.uid
    if (uid) {

        const userDoc = doc(collection(this.firestore, 'users'), uid)
        const todoCollection = collection(userDoc, 'todos')
        const todoDoc =  await addDoc(todoCollection, todoData)
        console.log('tododoc', todoDoc)
        // const todoDoc = setDoc(doc(todoCollection, userData.uid), userData)
        // Get the user's id
        // combineLatest([this.userService.getUser(uid)]).pipe(
        //     filter(([user]) => !!user),
        //     map(([user]) => {
        //         // const todo: any = {}
        //         console.log('todo - user', user)
        //     })
        // ).subscribe()

    }

  }

  editTodo() {
    console.log('edit todo')
  }

deleteTodo() {
    console.log('delete todo')
}

    completeTodo() {
        console.log('complete todo')
    }

    getTodos() {
        console.log('get todos')
    }
}
