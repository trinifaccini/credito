import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.css'],
  imports: [
    IonicModule
  ],
})

export class SplashPage implements OnInit {

    router = inject(Router);
  
    constructor() { }
  
    ngOnInit() {
  
      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 3500);
    }
  
}
