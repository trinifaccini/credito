import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { SplashPage } from './pages/splash/splash.page';
import { GamePage } from './pages/juego/juego.page';

export const routes: Routes = [

  {
      path: "",
      redirectTo: "splash",
      pathMatch: "full"
  },
  {
    path: "splash",
    component: SplashPage,
  },
  {
    path: "login",
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: "juego",
    loadComponent: () => import('./pages/juego/juego.page').then(m => m.GamePage),
  },
  { 
      path: '**', 
      redirectTo: "login",
  }
];

  