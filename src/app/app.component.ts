import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { initializeApp } from "firebase/app";
import { environment } from '../environment'
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-testing-playground';

  constructor(

  ) {
    initializeApp(environment.firebaseConfig);
  }
}
