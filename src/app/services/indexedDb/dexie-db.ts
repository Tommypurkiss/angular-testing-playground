import Dexie, { Table } from 'dexie';
import { OfflineTodo } from '../../interfaces/todo';

export class AppDB extends Dexie {

  todos!: Table<OfflineTodo, number>;

  constructor() {
    super('ngdexieliveQuery');
    //  Version 3 is the version from https://dexie.org/docs/Tutorial/Angular
    this.version(3).stores({
        todos: '++id',
    });
    this.on('populate', () => this.populate());
  }

//   Leaving empty but you can pre populate the database here
  async populate() {
  }
}

export const db = new AppDB();