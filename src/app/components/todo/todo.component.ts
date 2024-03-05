import { Component } from '@angular/core';
import { modules } from '../../modules/modules';
import { TodoService } from '../../services/todo/todo.service';
import { Observable, of } from 'rxjs';
import { Todo } from '../../interfaces/todo';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [modules],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent {
    todo: string = ''

    todos$: Observable<Todo[]> = of([])

    constructor(
        private todoService: TodoService
    ) {}

    async addTodo() {
        await this.todoService.addTodo(this.todo)
    }

}
