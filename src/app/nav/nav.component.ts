import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  isLoggedIn = false;

  constructor(private vs : ValidateService, private fm: FlashMessagesService, private as: AuthService, private rt: Router) { }
  ngOnInit() {
    this.isLoggedIn = this.as.loggedIn();
  }

  onLogoutClick(){
    this.as.logout();
    this.fm.show("Logged Out", {cssClass:'alert-success', timeout:3000});
    this.rt.navigate(['/login']);
    return false;
  }

  ngAfterContentChecked() {
    this.isLoggedIn = this.as.loggedIn();
  }

  canMngRole() {
    return this.as.canMngRole();
  }

}
