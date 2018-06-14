import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private as: AuthService, private rt: Router) { }

  ngOnInit() {
    if(this.as.isNewlyLoaded && this.as.loggedIn()){
      this.rt.navigate(['/profile']);
      }
  }

  ngOnDestroy(){
    this.as.refreshLocalUser();
  }

}
