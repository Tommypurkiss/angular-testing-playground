import { Injectable, OnInit, inject } from '@angular/core';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../interfaces/user';
import {
  BehaviorSubject,
  defer,
  EMPTY,
  filter,
  from,
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
import {
  DocumentData,
  getDocs,
  query,
  QueryDocumentSnapshot,
  updateDoc,
  where,
} from '@firebase/firestore';
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

  get getAuthUserId(): string | undefined {
    return this.authService.auth.currentUser?.uid;
  }

  async addTodo(todoData: Todo) {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoCollection = collection(userDoc, 'todos');
      addDoc(todoCollection, todoData);
    }
  }

  editTodo(todoId: string, updatedValue: string) {
    const uid = getAuth().currentUser?.uid;

    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      updateDoc(todoDoc, { value: updatedValue });
    }
  }

  async deleteTodo(todoId: string) {
    const uid = getAuth().currentUser?.uid;
    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
      deleteDoc(todoDoc);
    }
  }

  completeTodo(isChecked: boolean, todoId: string) {
    const uid = getAuth().currentUser?.uid;

    if (uid) {
      const userDoc = doc(collection(this.firestore, 'users'), uid);
      const todoDoc = doc(collection(userDoc, 'todos'), todoId);
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
            return () => unsubscribe();
          });
        }
      })
    );
  }

  //   OFFLINE STUFF
  get getOfflineTodosFromDexie(): Observable<OfflineTodo[]> {
    return defer(
      () =>
        liveQuery(() => db.todos.toArray()) as unknown as Observable<
          OfflineTodo[]
        >
    );
  }

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
    this.getOfflineTodosFromDexie
      .pipe(
        filter((offlineTodos) => !!offlineTodos.length),
        map((offlineTodos) => {
          const authUserId = this.getAuthUserId;
          if (!authUserId) return;

          const offlineTodosCollection = collection(this.firestore, 'offlineTodos');
          for (const offlineTodo of offlineTodos) {
            addDoc(offlineTodosCollection, offlineTodo);

            if (offlineTodo?.id) {
              db.todos.delete(offlineTodo.id);
            }
          }
        }),
        tap(() => db.todos.clear())
      )
      .subscribe();
  }

  get getAllOfflineTodos(): Observable<OfflineTodo[]> {
    return defer(async () => {
        const offlineTodosCollection = collection(this.firestore, 'offlineTodos')
        return (await getDocs(offlineTodosCollection)).docs.map((doc) => doc.data() as OfflineTodo);
    });

  }

  getOfflineTodosByUserId$(): Observable<
    QueryDocumentSnapshot<DocumentData, DocumentData>[]
  > {
    const authUserId = this.getAuthUserId;
    if (!authUserId) return EMPTY;

    return defer(async () => {
      const offlineTodoCollection = collection(this.firestore, 'offlineTodos');
      const userQuery = query(
        offlineTodoCollection,
        where('userId', '==', authUserId)
      );
      const docs = (await getDocs(userQuery)).docs;
      return docs;
    });
  }

  addOfflineTodosToUserTodos() {
    const authUserId = this.getAuthUserId;
    if (!authUserId) return;

    const offlineTodosCollection = collection(this.firestore, 'offlineTodos');
    const userDoc = collection(
        this.firestore,
        'users',
        authUserId,
        'todos'
      );

    this.getOfflineTodosByUserId$()
      .pipe(
        map((offlineTodosDoc) => {

          for (const todoDoc of offlineTodosDoc) {
            const todo = todoDoc.data();
            const mappedTodo: Todo = {
              value: todo['value'],
              completed: todo['completed'],
              userId: todo['userId'],
            };
            // Add to user todos
            addDoc(userDoc, mappedTodo);

            // delete from offlineTodos after adding to userTodos
            deleteDoc(doc((offlineTodosCollection), todoDoc.id));
          }
        })
      )
      .subscribe();
  }
}
