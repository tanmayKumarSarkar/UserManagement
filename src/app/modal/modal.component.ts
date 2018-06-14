import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ValidateService } from '../services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';
import { SessionCheckService } from '../services/session-check.service';
declare var $: any;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})


export class ModalComponent implements OnInit {

  constructor(private elmRef: ElementRef, private vs : ValidateService, private fm: FlashMessagesService, private as: AuthService, private rt: Router, private sc: SessionCheckService) { }

  username: String;
  password: String;
  tknExpTime;

  ngOnInit() {
    
  }

  ngAfterViewInit() {
  
  }

  ngAfterContentChecked() {
    this.tknExpTime = this.as.getExpNtfTime();
  }

  logOut(){
    this.as.logout();
    this.rt.navigate(['/login']);
  }
  onLoginSubmit(){
    const user = {
      username: this.username,
      password: this.password
    }
    if(user.username == undefined || user.username =="" || user.password == undefined || user.password == ""){
      this.fm.show("Please Fill All The Fields", {cssClass:'alert-danger', timeout:3000}); 
    }else{
      this.as.checkActivatedUser(user.username).subscribe(data=>{      
        if(data.success){
          this.as.authUser(user).subscribe(data=>{
            if(data.success){
              this.fm.show("Logged In", {cssClass:'alert-success', timeout:3000});
              this.as.storeUserData(data.token.split(' ')[1], data.user);
              //this.as.trackSession();
              this.rt.navigate(['/profile']);
              this.as.trackTokenAlive();
            }else{
              this.fm.show(data.msg, {cssClass:'alert-danger', timeout:3000}); 
              this.rt.navigate(['/login']);
            }
          });

        }else{
          this.fm.show(data.msg, {cssClass:'alert-danger', timeout:3000}); 
          this.rt.navigate(['/login']);
        }
      });
    }    
  }

  extendLogin(){
    this.as.extendAuthUser().subscribe(data=>{
      if(data.success){
        this.fm.show("LogIn Time Exeded", {cssClass:'alert-success', timeout:3000});
        this.as.storeUserData(data.token.split(' ')[1], data.user);
        this.as.trackTokenAlive();
        //this.as.trackSession();
        //this.rt.navigate(['/profile']);
      }else{
        this.fm.show(data.msg, {cssClass:'alert-danger', timeout:3000}); 
        this.rt.navigate(['/login']);
      }
    });
  }


}
