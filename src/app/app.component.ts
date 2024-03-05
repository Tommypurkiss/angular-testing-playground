import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { initializeApp } from "firebase/app";
import { environment } from '../environment'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-testing-playground';

  constructor() {
    initializeApp(environment.firebaseConfig);
  }
}
