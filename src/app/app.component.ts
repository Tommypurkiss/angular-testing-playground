import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../environment';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { IndexedDbService } from './services/indexedDb/indexed-db.service';
import { AuthService } from './auth/auth.service';
import { TodoService } from './services/todo/todo.service';
import { map } from 'rxjs';
import { OfflineTodo } from './interfaces/todo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    @HostBinding('class') class = 'h-full';

  title = 'angular-testing-playground';
  userHasOfflineTodos: boolean = false;
  userHasOfflineTodosMessage = '';

  constructor(
    private router: Router,
    private indexedDbService: IndexedDbService,
    private authService: AuthService,
    private todoService: TodoService
  ) {
    initializeApp(environment.firebaseConfig);

    window.addEventListener('offline', (event) => {
      console.log('The network connection has been lost.');
      this.router.navigate(['/offline']);
      this.indexedDbService.createDatabase();

      window.onbeforeunload = () => {
        return 'The network connection is lost. Are you sure you want to leave?';
      };
    });

    window.addEventListener('online', async (event) => {
      console.log('The network connection has been found.');
      this.router.navigate(['/dashboard']);

      this.todoService.syncOfflineTodos();
      await this.userHasOfflineTodosToSubmit();
    });
  }

  preventReload() {
    window.onbeforeunload = () => {
      return 'The network connection is lost. Are you sure you want to leave?';
    };
  }

  async userHasOfflineTodosToSubmit() {
    console.log('userHasOfflineTodosToSubmit');
    const uid = await this.getAuthUserId();
    console.log('uid', uid);
    if (uid) {
      const res = await this.todoService.getOfflineTodosByUserId(uid);
      console.log('res', res);
      res
        .pipe(
          map((todos) => {
            // console.log('todos', todos);
            if (todos.length > 0) {
              this.userHasOfflineTodosMessage = `You have ${todos.length} todos to upload, would you like to upload them now?`;
              this.userHasOfflineTodos = true;
            } else {
                this.userHasOfflineTodos = false;
            }
          })
        )
        .subscribe();
    }
  }

  async addOfflineTodosToUserTodos() {
    console.log('addOfflineTodosToUserTodos');
    const uid = await this.getAuthUserId();
    if (uid) {
      const res = await this.todoService.getOfflineTodosByUserId(uid);
      res
        .pipe(
          map(async (todos) => {
            console.log('todos 1', todos);
            const offlineTodoIds = todos.map((todo) => todo.id);
            for (const todo of todos) {
              console.log('adding offline to user');
              const offlineTodoData = todo.data() as OfflineTodo;
              console.log('offlineTodoData', offlineTodoData);
              console.log('todo.id', todo.id);
              const todoData = {
                value: offlineTodoData.value,
                userId: offlineTodoData.userId,
              };
              await this.todoService.addTodo(todoData);
            }

            for (const id of offlineTodoIds) {
              console.log('deleting offline todo');
              await this.todoService.deleteOfflineTodo(id);
            }

            this.userHasOfflineTodosToSubmit()
          })
        )
        .subscribe();
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
}
