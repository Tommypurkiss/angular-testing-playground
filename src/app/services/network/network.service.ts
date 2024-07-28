import { Injectable } from '@angular/core';
import { fromEvent, map, merge, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  constructor() {}

  checkNetworkStatus$(): Observable<boolean> {
    return merge(
      of(null),
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(map(() => navigator.onLine));
  }
}
