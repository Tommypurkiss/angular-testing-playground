import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    console.log('rt', route)
    console.log('st', state)
  return true;
};


import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      map(user => {
        if (user) {
          return true; // User is authenticated, allow navigation
        } else {
          this.router.navigate(['/login']); // User is not authenticated, navigate to landing page
          return false; // Block navigation
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']); // Handle error, navigate to landing page
        return of(false); // Block navigation
      })
    );
  }
}
