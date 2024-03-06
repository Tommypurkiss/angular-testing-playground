import { Injectable, OnInit, inject } from '@angular/core';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../interfaces/user';
import { Observable, of, switchMap } from 'rxjs';
import { getAuth } from 'firebase/auth';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
} from '@angular/fire/firestore';
import { OfflineTodo, Todo } from '../../interfaces/todo';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { getDocs, query, updateDoc, where } from '@firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  firestore = inject(Firestore);

  todos$: Observable<Todo[]> = of([]);

  constructor(
    private authService: AuthService,
    private indexedDbService: IndexedDbService
  ) {}

  async addTodo(todoData: Todo) {

    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoCollection = collection(userDoc, 'todos');
      const todoDoc = await addDoc(todoCollection, todoData);
    }
  }

  editTodo() {
    console.log('edit todo');
  }

  async deleteTodo(todoId: string) {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      await deleteDoc(todoDoc);
    }
  }

  async deleteOfflineTodo(todoId: string) {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const todoDoc = doc(collection(this.firestore, 'offlineTodos'), todoId);
      console.log('deleteOfflineTodo - deleting offline todo', todoDoc, todoId)
      await deleteDoc(todoDoc);
    }
  }

  completeTodo( isChecked: boolean, todoId: string) {
    console.log('isChecked', isChecked);
    console.log('complete todo');
    const uid = getAuth().currentUser?.uid;

    if (uid) {
        const userDoc = doc(collection(this.firestore, 'users'), uid);
        const todoDoc = doc(collection(userDoc, 'todos'), todoId);
        console.log('todoDoc', todoDoc);
        updateDoc(todoDoc, { completed: isChecked })
    }
  }


  getTodos(): Observable<Todo[]> {
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
                todos.push({ ...doc.data(), id: doc.id } as Todo);
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

  //   OFFLINE STUFF
  async addTodoOffline(todo: Todo) {
    const userId = await this.getAuthUserId();
    if (userId) {
      const offlineTodo: OfflineTodo = { ...todo, userId: userId };
      this.indexedDbService.addTodo(offlineTodo);
    }
  }

  async getAuthUserId() {
    const currentAuthUser = this.authService.auth;
    console.log(
      'addTodoOffline - currentAuthUser',
      currentAuthUser?.currentUser?.uid
    );
    const userId = currentAuthUser?.currentUser?.uid;
    return userId;
  }


  syncOfflineTodos() {
    this.indexedDbService.getAllOfflineTodos().then((offlineTodos) => {
      console.log('offlineTodos', offlineTodos);
      offlineTodos.forEach(async (offlineTodo) => {
        console.log('offlineTodo', offlineTodo);
        const uid = getAuth().currentUser?.uid;
        if (uid) {
          const todoCollection = collection(this.firestore, 'offlineTodos');
          const todoDoc = await addDoc(todoCollection, offlineTodo);
          console.log('todoDoc', todoDoc);
        }

      });
    });
    this.indexedDbService.deleteAllTodos();
  }

  async getOfflineTodosByUserId(userId: string) {
    const offlineTodoCollection = collection(this.firestore, 'offlineTodos');
    const userQuery = query(offlineTodoCollection, where('userId', '==', userId));
    const docs = (await getDocs(userQuery)).docs
    console.log('docs', docs);
    return of(docs)
    // console.log('userQuery', userQuery);
    // return getDocs(userQuery).pipe(
    //   map(snapshot => {
    //     return snapshot.docs.map(doc => doc.data() as Todo);
    //   })
    // );
  }
}
