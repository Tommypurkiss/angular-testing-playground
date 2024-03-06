import { Injectable, OnInit, inject } from '@angular/core';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../interfaces/user';
import {
  Observable,
  combineLatest,
  filter,
  from,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { getAuth } from 'firebase/auth';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
} from '@angular/fire/firestore';
import { Todo } from '../../interfaces/todo';
import { getDoc } from '@firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  firestore = inject(Firestore);

  todos$: Observable<Todo[]> = of([]);

  constructor(
    private authService: AuthService,
  ) {}

  async addTodo(todoValue: string) {
    console.log('add todo');

    const todoData: Todo = { value: todoValue };

    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoCollection = collection(userDoc, 'todos');
      const todoDoc = await addDoc(todoCollection, todoData);
      console.log('tododoc', todoDoc);
    }
  }

  editTodo() {
    console.log('edit todo');
  }

  async deleteTodo(todoId: string) {
    console.log('delete todo');
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      await deleteDoc(todoDoc);
    }
  }

  completeTodo() {
    console.log('complete todo');
  }

  getTodos(): Observable<Todo[]> {
    console.log('get todos');

    return this.authService.user$.pipe(
      switchMap((auth) => {
        if (!auth) {
          // If user is not logged in, return an empty array
          return of([]);
        } else {
          // If user is logged in, return real-time updates to todos
          const userDoc = collection(
            this.firestore,
            'users',
            auth.uid,
            'todos'
          );
          return new Observable<Todo[]>((observer) => {
            const unsubscribe = onSnapshot(userDoc, (querySnapshot) => {
              const todos: Todo[] = [];
              querySnapshot.forEach((doc) => {
                todos.push({...doc.data(), id: doc.id} as Todo);
              });
              observer.next(todos);
            });
            // Clean up listener on unsubscribe
            return () => unsubscribe();
          });
        }
      })
    );
  }
}
