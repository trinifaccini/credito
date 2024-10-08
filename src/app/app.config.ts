import { ApplicationConfig, CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';



const firebaseConfig = {
  apiKey: "AIzaSyD9EjwtNE9XDa1QPL_iqCVVOCaEAmj1mxk",
  authDomain: "practica-profesional-faccini.firebaseapp.com",
  projectId: "practica-profesional-faccini",
  storageBucket: "practica-profesional-faccini.appspot.com",
  messagingSenderId: "1094929870630",
  appId: "1:1094929870630:web:3fff88f9b26b69e7435be7"
}

export const appConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(), 
    provideAnimationsAsync('noop'),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    importProvidersFrom(IonicModule.forRoot()), // Proveer HttpClientModule
    importProvidersFrom(HttpClientModule), provideAnimationsAsync('noop'), provideAnimationsAsync('noop'), // Proveer HttpClientModule
    provideFirestore(() => getFirestore())

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

};
