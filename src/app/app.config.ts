import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"angular-testing-playground","appId":"1:465246130509:web:473459c3f2d9fe5403e704","storageBucket":"angular-testing-playground.appspot.com","apiKey":"AIzaSyDO0h4zgm6boWfhgZ5Jh4uSnepr1YCOu74","authDomain":"angular-testing-playground.firebaseapp.com","messagingSenderId":"465246130509","measurementId":"G-K3VKC9GLL9"}))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore())), importProvidersFrom(provideMessaging(() => getMessaging()))]
};
