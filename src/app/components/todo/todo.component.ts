import { Component, HostBinding, OnInit } from '@angular/core';
import { modules } from '../../modules/modules';
import { TodoService } from '../../services/todo/todo.service';
import { from, Observable, of } from 'rxjs';
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
export class TodoComponent implements OnInit {
@HostBinding('class') class = 'h-full flex flex-col flex-1';


  todo: string = '';
  updatedTodo: string = '';
  selectedTodoId: string = '';
  todos$: Observable<any> = of([]);
  isEditing: boolean = false;
  onlineStatus$ = this.networkService.checkNetworkStatus$();


//   dexie & offline todos
  offlinetodoItems$ = liveQuery(
    () => db.todos.toArray()
  ) as unknown as Observable<OfflineTodo[]>;
  selectedOfflineTodoId: number = 0;
  updatedOfflineTodo: string = '';



  constructor(
    private todoService: TodoService,
    private indexedDbService: IndexedDbService,
    private networkService: NetworkService

  ) {
    this.todos$ = this.todoService.getTodos(); // Initialize todos$ in the constructor
  }

  ngOnInit() {
    this.offlinetodoItems$.subscribe((todoItems) => {
        console.log('todoItems', todoItems);
    })
    // db.table('todos').clear(); // Clear the todos table - only use when you want to clear the table
  }

  async addTodo(): Promise<void> {
    if (this.todo === '') return;
    const todo: Todo = { value: this.todo };
    await this.todoService.addTodo(todo);
    this.todo = '';
  }

  completeTodo(event: Event, todoId: string) {
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
        const offlineTodo: OfflineTodo = { value: this.todo, completed: false };
        db.todos.add(offlineTodo)
    }

    toggleEditOfflineTodo(todoId?: number): void {
        if(!todoId) return

        console.log('toggleEditOfflineTodo', todoId);
        this.isEditing = !this.isEditing;
        this.selectedOfflineTodoId = todoId;
    }

    editOfflineTodo(todoId: number): void {
        this.isEditing = !this.isEditing;
        db.todos.update(todoId, { value: this.updatedOfflineTodo });
    }

    deleteOfflineTodo(todoId?: number): void {
        if(!todoId) return

        console.log('deleteOfflineTodo', todoId);
        // this.todoService.deleteTodo(todoId);
        db.todos.delete(todoId);
    }

    completeOfflineTodo(event: Event, todoId?: number) {
        if(!todoId) return

        const isChecked = (event.target as HTMLInputElement).checked;
        db.todos.update(todoId, { completed: isChecked });
      }
}
