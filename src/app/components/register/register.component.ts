import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

import { modules } from '../../modules/modules';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [modules],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

    registerEmail: string = ''
    registerPassword: string = ''

    constructor(
        private authService: AuthService
    ) {}


    registerWithEmailAndPassword() {
        this.authService.registerWithEmailAndPassword(this.registerEmail, this.registerPassword)
    }


}
