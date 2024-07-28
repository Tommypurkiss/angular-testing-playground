import { Injectable, OnInit, inject } from '@angular/core';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../interfaces/user';
import {
  BehaviorSubject,
  defer,
  EMPTY,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
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
import { db } from '../indexedDb/dexie-db';
import { NetworkService } from '../network/network.service';
import { liveQuery } from 'dexie';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  firestore = inject(Firestore);

  todos$: Observable<Todo[]> = of([]);

  onlineStatus$ = this.networkService.checkNetworkStatus$();

  //   offlinetodoItems$: BehaviorSubject<OfflineTodo[]> = new BehaviorSubject<OfflineTodo[]>(liveQuery(() => db.todos.toArray()) as unknown as OfflineTodo[]);

  constructor(
    private authService: AuthService,
    private indexedDbService: IndexedDbService,
    private networkService: NetworkService
  ) {}

  async addTodo(todoData: Todo) {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoCollection = collection(userDoc, 'todos');
      const todoDoc = await addDoc(todoCollection, todoData);
    }
  }

  editTodo(todoId: string, updatedValue: string) {
    console.log('edit todo');
    const uid = getAuth().currentUser?.uid;

    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      console.log('todoDoc', todoDoc);
      updateDoc(todoDoc, { value: updatedValue });
    }
  }

  async deleteTodo(todoId: string) {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      await deleteDoc(todoDoc);
    }
  }

  //   async deleteOfflineTodo(todoId: string) {
  //     const uid = getAuth().currentUser?.uid;
  //     if (uid) {
  //       const todoDoc = doc(collection(this.firestore, 'offlineTodos'), todoId);
  //       console.log('deleteOfflineTodo - deleting offline todo', todoDoc, todoId)
  //       await deleteDoc(todoDoc);
  //     }
  //   }

  completeTodo(isChecked: boolean, todoId: string) {
    console.log('isChecked', isChecked);
    console.log('complete todo');
    const uid = getAuth().currentUser?.uid;

    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      console.log('todoDoc', todoDoc);
      updateDoc(todoDoc, { completed: isChecked });
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
  //   async addTodoOffline(todo: Todo) {
  //     const userId = await this.getAuthUserId();
  //     if (userId) {
  //       const offlineTodo: Todo = { ...todo, userId: userId };
  //     //   db.todoItems.add(offlineTodo);
  //     //   this.indexedDbService.addTodo(offlineTodo);
  //     }
  //   }

  get getAuthUserId(): string | undefined {
    // const currentAuthUser = this.authService.auth;
    // console.log(
    //   'addTodoOffline - currentAuthUser',
    //   currentAuthUser.currentUser
    // );
    // if(currentAuthUser.currentUser) {
    //     console.log('currentAuthUser.currentUser.uid', currentAuthUser.currentUser.uid);
    // }
    // const userId = currentAuthUser?.currentUser?.uid;
    // return userId;

    // return getAuth().currentUser?.uid;

    return this.authService.auth.currentUser?.uid;

    // return defer(() => {
    //     if(!this.authService.auth.currentUser) return EMPTY

    //     return this.authService.auth.currentUser.uid

    // })
  }

  get getOfflineTodos(): Observable<OfflineTodo[]> {
    return defer(
      () =>
        liveQuery(() => db.todos.toArray()) as unknown as Observable<
          OfflineTodo[]
        >
    );
  }

  //   syncOfflineTodos() {
  //     this.indexedDbService.getAllOfflineTodos().then((offlineTodos) => {
  //       console.log('offlineTodos', offlineTodos);
  //       offlineTodos.forEach(async (offlineTodo) => {
  //         console.log('offlineTodo', offlineTodo);
  //         const uid = getAuth().currentUser?.uid;
  //         if (uid) {
  //           const todoCollection = collection(this.firestore, 'offlineTodos');
  //           const todoDoc = await addDoc(todoCollection, offlineTodo);
  //           console.log('todoDoc', todoDoc);
  //         }

  //       });
  //     });
  //     this.indexedDbService.deleteAllTodos();
  //   }

  addOfflineTodo(todoValue: string): void {
    const authUserId = this.getAuthUserId;
    if (!authUserId) return;

    const offlineTodo: OfflineTodo = {
      value: todoValue,
      completed: false,
      userId: authUserId,
    };
    db.todos.add(offlineTodo);
  }

  syncOfflineTodos(): void {
    console.log('syncing offline todos');
    this.getOfflineTodos
      .pipe(
        filter((offlineTodos) => !!offlineTodos.length),
        tap((offlineTodos) => console.log('offlineTodos: ', offlineTodos)),
        map((offlineTodos) => {
          const authUserId = this.getAuthUserId;
          if (!authUserId) return;
          console.log('uid', authUserId);

          const todoCollection = collection(this.firestore, 'offlineTodos');
          for (const offlineTodo of offlineTodos) {
            const todoDoc = addDoc(todoCollection, offlineTodo);
            console.log('todoDoc', todoDoc);
          }
        }),
        tap(() => db.todos.clear())
      )
      .subscribe();
  }

  async getOfflineTodosByUserId(userId: string) {
    const offlineTodoCollection = collection(this.firestore, 'offlineTodos');
    const userQuery = query(
      offlineTodoCollection,
      where('userId', '==', userId)
    );
    const docs = (await getDocs(userQuery)).docs;
    console.log('docs', docs);
    return of(docs);
  }
}
