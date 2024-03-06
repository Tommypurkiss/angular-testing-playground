import { Injectable } from '@angular/core';
import { OfflineTodo, Todo } from '../../interfaces/todo';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbService {
  db: any;

  constructor() {}

  async createDatabase() {
    if (!this.indexedDBSupport())
      throw new Error("Your browser doesn't support IndexedDB");

    if (!this.db) {
      const request = window.indexedDB.open('MyDatabase', 1);

      request.onerror = (e: any) => {
        console.log('Error opening database:', e.target.error);
      };

      request.onsuccess = (e) => {
        console.info('Successful database connection');
        this.db = request.result;
      };

      request.onupgradeneeded = (e) => {
        console.info('Database created');
        const db = request.result;
        db.createObjectStore('todo', { keyPath: 'id' });
      };
    }
  }

  async addTodo(todo: OfflineTodo) {
    console.log('add todo', todo);

    if (!this.db) {
      throw new Error('Database not initialized. Call createDatabase first.');
    }

    console.log('add this db', this.db);

    const todoWithId = { ...todo, id: uuidv4() };
    const transaction = this.db.transaction('todo', 'readwrite');

    const objectStore = transaction.objectStore('todo');
    const request = objectStore.add(todoWithId);

    request.onsuccess = () => {
      console.log(`New todo added: ${request.result}`);
    };

    request.onerror = (err: any) => {
      console.log(`Error adding new todo: ${err}`);
    };
  }

  indexedDBSupport() {
    return 'indexedDB' in window;
  }


  async getAllOfflineTodos(): Promise<OfflineTodo[]> {
    // Ensure the database is initialized
    if (!this.db) {
      throw new Error('Database not initialized. Call createDatabase first.');
    }

    // Retrieve all todos from the object store
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('todo', 'readonly');
      const objectStore = transaction.objectStore('todo');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const todos = request.result;
        resolve(todos);
      };

      request.onerror = (err: any) => {
        reject(err);
      };
    });
  }

 async deleteAllTodos() {
    if (!this.db) {
      throw new Error('Database not initialized. Call createDatabase first.');
    }

    const transaction = this.db.transaction('todo', 'readwrite');
    const objectStore = transaction.objectStore('todo');
    const request = objectStore.openCursor();

    request.onsuccess = (event: any) => {
      const cursor = event.target.result;
      if (cursor) {
        objectStore.delete(cursor.primaryKey);
        cursor.continue();
      } else {
        console.log('All todos deleted successfully.');
      }
    };

    request.onerror = (err: any) => {
      console.error('Error deleting todos:', err);
    };
  }
}
