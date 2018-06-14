import { Component, OnInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../services/auth.service';
import { RouteReuseStrategy, ActivatedRoute, Router } from '@angular/router';
import { ValidateService } from '../services/validate.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  constructor(private fm: FlashMessagesService, private as: AuthService, private vs: ValidateService, private rt: Router) { }

  selected: Boolean;
  username: String;
  email: String;
  resetObj: Object;

  ngOnInit() {
    this.selected = false;
  }

  onResetSubmit(){
    if(this.selected){
      //console.log(this.email);
      this.resetObj = {email: this.email};
    }else{
      //console.log(this.username);
      this.resetObj = {username: this.username};
    }

    this.as.resetPassword(this.resetObj).subscribe(data=>{      
      if(data.success){
        this.fm.show(data.msg, {cssClass:'alert-success', timeout:6000});
        setTimeout(()=>{
          this.rt.navigate(['/login']);
        },2000);
      }else{
        this.fm.show(data.msg, {cssClass:'alert-danger', timeout:6000}); 
      }
    });

  }

}
