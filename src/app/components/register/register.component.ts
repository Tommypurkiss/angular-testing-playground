import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
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
