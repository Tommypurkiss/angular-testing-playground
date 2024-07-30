import { Component, HostBinding, OnInit } from '@angular/core';
import { modules } from '../../modules/modules';
import { TodoService } from '../../services/todo/todo.service';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { OfflineTodo, Todo } from '../../interfaces/todo';
// import { getAuth } from 'firebase/auth';
import { IndexedDbService } from '../../services/indexedDb/indexed-db.service';
import { liveQuery } from 'dexie';
import { db } from '../../services/indexedDb/dexie-db';
import { NetworkService } from '../../services/network/network.service';
// import { db } from '../../services/indexedDb/dexie-db';
// import { liveQuery } from 'dexie';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [modules],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
})
export class TodoComponent  {
  @HostBinding('class') class = 'h-full flex flex-col flex-1';

  todo: string = '';
  updatedTodo: string = '';
  selectedTodoId: string = '';
  todos$: Observable<any> = of([]);
  isEditing: boolean = false;
  onlineStatus$ = this.networkService.checkNetworkStatus$();

  //   dexie & offline todos
  offlinetodoItems$ = this.todoService.getOfflineTodosFromDexie;
  selectedOfflineTodoId: number = 0;
  updatedOfflineTodo: string = '';
  offlineTodosFromOfflineTodosCollection: Observable<OfflineTodo[]> = of([]);

  constructor(
    private todoService: TodoService,
    private networkService: NetworkService
  ) {
    this.todos$ = this.todoService.getTodos(); // Initialize todos$ in the constructor
    // this.offlineTodosFromOfflineTodosCollection = this.todoService.getAllOfflineTodos
  }

  async addTodo(): Promise<void> {
    if (this.todo === '') return;
    const todo: Todo = { value: this.todo };
    await this.todoService.addTodo(todo);
    this.todo = '';
  }

  completeTodo(event: Event, todoId: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.todoService.completeTodo(isChecked, todoId);
  }

  getTodos(): void {
    this.todos$ = this.todoService.getTodos();
  }

  toggleEditTodo(todoId: string): void {
    this.isEditing = !this.isEditing;
    this.selectedTodoId = todoId;
  }

  editTodo(todoId: string): void {
    this.isEditing = !this.isEditing;
    this.todoService.editTodo(todoId, this.updatedTodo);
  }

  deleteTodo(todoId: string): void {
    this.todoService.deleteTodo(todoId);
  }

  //   offline
  addOfflineTodo(): void {
    this.todoService.addOfflineTodo(this.todo);
    this.todo = '';
  }

  toggleEditOfflineTodo(todoId?: number): void {
    if (!todoId) return;

    console.log('toggleEditOfflineTodo', todoId);
    this.isEditing = !this.isEditing;
    this.selectedOfflineTodoId = todoId;
  }

  editOfflineTodo(todoId: number): void {
    this.isEditing = !this.isEditing;
    db.todos.update(todoId, { value: this.updatedOfflineTodo });
  }

  deleteOfflineTodo(todoId?: number): void {
    if (!todoId) return;

    console.log('deleteOfflineTodo', todoId);
    db.todos.delete(todoId);
  }

  completeOfflineTodo(event: Event, todoId?: number): void {
    if (!todoId) return;

    const isChecked = (event.target as HTMLInputElement).checked;
    db.todos.update(todoId, { completed: isChecked });
  }

  showOfflineTodos() {
    this.offlineTodosFromOfflineTodosCollection = this.todoService.getAllOfflineTodos
  }
}
