import { Component, OnInit } from '@angular/core';
import { modules } from '../../modules/modules';
import { TodoService } from '../../services/todo/todo.service';
import { Observable, of } from 'rxjs';
import { Todo } from '../../interfaces/todo';
import { getAuth } from 'firebase/auth';
import { IndexedDbService } from '../../services/indexedDb/indexed-db.service';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [modules],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
})
export class TodoComponent implements OnInit {
  todo: string = '';

  todos$: Observable<any> = of([]);

  constructor(private todoService: TodoService, private indexedDbService: IndexedDbService) {
    this.todos$ = this.todoService.getTodos(); // Initialize todos$ in the constructor
  }

  ngOnInit() {}

  async addTodo(): Promise<void> {
    if (this.todo === '') return
    const todo: Todo = { value: this.todo };
    await this.todoService.addTodo(todo);
    this.todo = '';
  }

  completeTodo(event: Event, todoId: string) {
    // console.log(event);
    const isChecked = (event.target as HTMLInputElement).checked;
    this.todoService.completeTodo(isChecked, todoId);
  }

  getTodos(): void {
    this.todos$ = this.todoService.getTodos();
  }

  deleteTodo(todoId:string): void {
    this.todoService.deleteTodo(todoId);
  }

  async logIndexedDb() {
    await this.indexedDbService.logIndexedDb();
  }
 }
