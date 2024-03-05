import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { User } from '../../interfaces/user';
import { modules } from '../../modules/modules';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [modules],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    user$: Observable<User | null> = of(null)

    constructor(
        public authService: AuthService
    ) {
        this.user$ = this.authService.user$
    }

    onSignOut() {
        this.authService.logout()
    }
}
