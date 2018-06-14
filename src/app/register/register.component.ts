import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../services/validate.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  name: String;
  username: String;
  email: String;
  password: String;
  cnfPassword: String;

  constructor(private vs : ValidateService, private fm: FlashMessagesService, private as: AuthService, private rt: Router) { }

  ngOnInit() {
  }

  onRegisterSubmit(){
    let user = {
      name: this.name,
      username: this.username,
      email: this.email,
      password: this.password
    }
    if(!this.vs.validateRegister(user)){
      this.fm.show("Please Fill-in All The Details", {cssClass:'alert-danger', timeout:3000}); 
      return false;     
    }
    if(!this.vs.validateEmail(user.email)){
      this.fm.show("please Enter valid Email", {cssClass:'alert-danger', timeout:3000});  
      return false;
    }

    this.as.registerUser(user).subscribe(data => {
      console.log(data);
      if(data.success){
        this.fm.show(data.msg, {cssClass:'alert-success', timeout:3000});
        this.rt.navigate(['/login']);
      }else{
        this.fm.show(data.msg, {cssClass:'alert-danger', timeout:3000}); 
        this.rt.navigate(['/register']);
      }
    });
//part7
  }

  comparePwd(){
    if(this.password === this.cnfPassword){
      return true;
    }    
  }

}
