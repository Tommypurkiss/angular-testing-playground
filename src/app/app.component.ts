import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../environment';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { IndexedDbService } from './services/indexedDb/indexed-db.service';
import { AuthService } from './auth/auth.service';
import { TodoService } from './services/todo/todo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-testing-playground';

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
    //   const result = await this.indexedDbService.getAllOfflineTodos();
    //   console.log('result', result);
    this.todoService.syncOfflineTodos();
    });
  }

  preventReload() {
    window.onbeforeunload = () => {
      return 'The network connection is lost. Are you sure you want to leave?';
    };
  }
}
