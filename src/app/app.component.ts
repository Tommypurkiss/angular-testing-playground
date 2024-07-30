import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../environment';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './auth/auth.service';
import { TodoService } from './services/todo/todo.service';
import { NetworkService } from './services/network/network.service';
import { map } from 'rxjs';

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

  onlineStatus$ = this.networkService.checkNetworkStatus$();

  constructor(
    private authService: AuthService,
    private todoService: TodoService,
    private networkService: NetworkService
  ) {
    initializeApp(environment.firebaseConfig);

    window.addEventListener('online', (event) => {
      console.log('The network connection has been found.');
      this.todoService.syncOfflineTodos();

      this.checkUserHasOfflineTodosMessage();
    });
  }

  get getAuthUserId(): string | undefined {
    return this.authService.auth.currentUser?.uid;
  }

  preventReload(): void {
    window.onbeforeunload = () => {
      window.confirm(
        'The network connection is lost. Are you sure you want to leave?'
      );
    };
  }

  checkUserHasOfflineTodosMessage(): void {
    this.todoService
      .getOfflineTodosByUserId$()
      .pipe(
        map((todos) => {
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

  addOfflineTodosToUserTodos(): void {
    this.todoService.addOfflineTodosToUserTodos();
    this.userHasOfflineTodos = false;
  }
}
