import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../services/validate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  userid: String;
  validUser: Boolean = false;
  mgtUser;
  mgtUserUp;
  x;

  constructor(private route: ActivatedRoute, private fm: FlashMessagesService, private as: AuthService, private rt: Router, private vs: ValidateService) { }

  ngOnInit() {
    if(this.as.isNewlyLoaded || this.as.permission == undefined || this.as.permission == '' || (this.as.permission != 'admin' && this.as.permission != 'moderator')){
      this.rt.navigate(['/profile']);
    }
    this.userid = this.route.snapshot.paramMap.get('id');
    this.getUserDetails();
  }

  getUserDetails(){
    this.as.getUserDetailAPI(this.userid).subscribe(data=>{      
      if(data.success){
        this.fm.show(data.msg, {cssClass:'alert-success', timeout:1000});
        this.validUser = true;
        this.mgtUser = data.user;
        //console.log(this.mgtUser);
        this.mgtUserUp = {
          name: this.mgtUser.name,
          permission: this.mgtUser.permission,
          active: this.mgtUser.active == true ? 'true' : 'false'
        }
      }else{
        this.fm.show(data.msg, {cssClass:'alert-danger', timeout:6000}); 
        this.validUser = false;
        this.rt.navigate(['/profile']);
      }
    });
  }

  updateProfile(id, input){
    this.mgtUserUp.active = (this.mgtUserUp.active == 'true' || this.mgtUserUp.active == 'TRUE') ? true : false
    //console.log(this.mgtUserUp,input);
    this.updateProfileReqAPI(this.mgtUser._id, input);
  }

  updateProfileReqAPI(id, input){
    this.as.updateProfile(id, this.mgtUserUp).subscribe(profile =>{
      this.mgtUser = profile;
      this.mgtUserUp = {
        name: this.mgtUser.name,
        permission: this.mgtUser.permission,
        active: this.mgtUser.active == true ? 'true' : 'false'
      }
      this.fm.show(`User ${input} updated successfully`, {cssClass:'alert-success', timeout:2000});
      //console.log(this.mgtUserUp);
    },err=>{
      this.fm.show("Something went wrong, Please try agin", {cssClass:'alert-danger', timeout:3000});
      return false;
    });
    //this.as.user = this.user;    
  }

  ngAfterViewChecked(){
    if(this.as.isNewlyLoaded || this.as.permission == undefined || this.as.permission == '' || (this.as.permission != 'admin' && this.as.permission != 'moderator')){
      this.rt.navigate(['/profile']);
    }
  }
  
  ngOnDestroy(){
    this.as.refreshLocalUser();
  }

}
