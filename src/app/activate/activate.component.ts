import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from '../services/validate.service';
import { timeout } from 'q';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent implements OnInit {

  constructor(private route: ActivatedRoute, private fm: FlashMessagesService, private as: AuthService, private rt: Router, private vs: ValidateService) { }

  token: String;
  invalidtoken: Boolean;
  email: String;

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token');
    this.invalidtoken = false;
    this.as.confirmRegistration(this.token).subscribe(data=>{      
      if(data.success){
        this.fm.show(data.msg, {cssClass:'alert-success', timeout:6000});
        this.invalidtoken = false;
        this.rt.navigate(['/login']);
      }else{
        this.fm.show(data.msg, {cssClass:'alert-danger', timeout:6000}); 
        this.invalidtoken = true;
        //this.rt.navigate(['/login']);
      }
    });
  }

  onResendSubmit(){
    if(this.email == undefined || this.email == '' || !this.vs.validateEmail(this.email)){        
      this.fm.show("Please Insert Correct E-Mail", {cssClass:'alert-danger', timeout:3000}); 
    }else{
      this.as.resendRegistration(this.email).subscribe(data=>{      
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
