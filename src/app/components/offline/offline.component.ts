import { Component } from '@angular/core';
import { TodoService } from '../../services/todo/todo.service';
import { modules } from '../../modules/modules';
import { Todo } from '../../interfaces/todo';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [modules],
  templateUrl: './offline.component.html',
  styleUrl: './offline.component.scss',
})
export class OfflineComponent {
  offlineTodo: string = '';

  constructor(private todoService: TodoService, private authService: AuthService) {}


  createTodo() {
    this.authService.user$.subscribe((user) => {
        console.log('user', user);
    })
    console.log('create offline todo');
    const todoValue: Todo = {value: this.offlineTodo}; // Get the todo value from user input or any other source
    this.todoService.addTodoOffline(todoValue);

  }
}
