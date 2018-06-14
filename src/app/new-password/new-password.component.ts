import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from '../services/validate.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css']
})
export class NewPasswordComponent implements OnInit {

  constructor(private route: ActivatedRoute, private fm: FlashMessagesService, private as: AuthService, private rt: Router, private vs: ValidateService) { }

  token: String;
  invalidtoken: Boolean;
  password: String;
  cnfPassword: String;
  uid: String;

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.invalidtoken = false;
    this.as.confirmNewPwdToken(this.token).subscribe(data=>{      
      if(data.success){
        this.fm.show(data.msg, {cssClass:'alert-success', timeout:6000});
        this.invalidtoken = false;
        this.uid = data.user._id;
      }else{
        this.fm.show(data.msg, {cssClass:'alert-danger', timeout:6000}); 
        this.invalidtoken = true;
        this.rt.navigate(['/reset']);
      }
    });
  }

  onResetSubmit(){
    if(this.password == undefined || this.password == '' || this.cnfPassword == undefined || this.cnfPassword == ''){        
      this.fm.show("Please Insert Password Correctly", {cssClass:'alert-danger', timeout:3000}); 
    }else{
      this.as.setNewPassword(this.uid, this.password).subscribe(data=>{
        if(data.success){
          this.fm.show(data.msg, {cssClass:'alert-success', timeout:6000});
          this.invalidtoken = false;
          setTimeout(()=>{
            this.rt.navigate(['/login']);
          },2000);
        }else{
          this.fm.show(data.msg, {cssClass:'alert-danger', timeout:6000}); 
          this.invalidtoken = true;
        }
      });
    }
  }

}
