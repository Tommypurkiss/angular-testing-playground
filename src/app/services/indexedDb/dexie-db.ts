import Dexie, { Table } from 'dexie';
import { Todo } from '../../interfaces/todo';

// export interface TodoList {
//   id?: number;
//   title: string;
// }
// export interface TodoItem {
//   id?: number;
//   todoListId: number;
//   title: string;
//   done?: boolean;
// }

export class AppDB extends Dexie {
  todoItems!: Table<Todo, number>;
//   todoLists!: Table<Todo[], number>; // for multiple lists

  constructor() {
    super('ngdexieliveQuery');
    this.version(3).stores({
      todoLists: '++id',
    //   todoItems: '++id, todoListId', // for multiple lists
    });
    this.on('populate', () => this.populate());
  }

  populate() {
    console.log('populate');
    // from https://dexie.org/docs/Tutorial/Angular
    // const todoListId = await db.todoLists.add({
    //   title: 'To Do Today',
    // });
    // await db.todoItems.bulkAdd([
    //   {
    //     todoListId,
    //     title: 'Feed the birds',
    //   },
    //   {
    //     todoListId,
    //     title: 'Watch a movie',
    //   },
    //   {
    //     todoListId,
    //     title: 'Have some sleep',
    //   },
    // ]);

    // const offlineTodosList = this.todoItems.add()
    // console.log('offlineTodosList', offlineTodosList);
  }
}

export const db = new AppDB();