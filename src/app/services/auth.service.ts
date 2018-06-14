import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired, JwtHelper } from 'angular2-jwt';
import { SessionCheckService } from './session-check.service';
declare var $: any;

@Injectable()
export class AuthService {

  authToken : any;
  user: { id:String, name: String,username: String,email: String, permission: String}
  api: String = 'http://localhost:3000' || '';
  islogOutBtn: Boolean = false;
  tknExpTime;
  tknExpNtfyTime = 2*60*1000;  //mili seconds
  isNewlyLoaded = true;
  permission;
  sessionSub;
  idleSub;
  tokenTimeout;

  constructor(private http: Http, private sc: SessionCheckService, private jwtHelper: JwtHelper) {
    this.user= {id:'', name: '',username: '',email: '', permission: ''};
   }

  registerUser(user){
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(`${this.api}/api/users`, user, {headers: headers})
      .map(res=> res.json());
  }

  authUser(user){
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(`${this.api}/api/login`, user, {headers: headers})
      .map(res=> res.json());
  }

  loggedIn(){
    if(!tokenNotExpired('id_token') || (!localStorage.getItem('id_token'))){
      localStorage.clear();
      return false;
    }
    return tokenNotExpired('id_token');
  }

  confirmRegistration(token){
    return this.http.get(`${this.api}/api/confirmation/${token}`)
      .map(res=> res.json());
  }

  resendRegistration(email){
    return this.http.get(`${this.api}/api/resendconfirmation/${email}`)
      .map(res=> res.json());
  }

  checkActivatedUser(username){
    return this.http.get(`${this.api}/api/checkactivateduser/${username}`)
      .map(res=> res.json());
  }

  getProfileAPI(){
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.getToken());
    return this.http.post(`${this.api}/api/profile`,{}, {headers: headers})
      .map(res=> res.json());
  }

  updateProfile(id, user){
    let headers = new Headers({'Content-Type': 'application/json'});
    return this.http.put(`${this.api}/api/profile/${id}`,user, {headers: headers})
      .map(res=> res.json());
  }

  extendAuthUser(){
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(`${this.api}/api/extendlogin`, {token: this.getToken()}, {headers: headers})
      .map(res=> res.json());
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
    this.islogOutBtn = false;
    //console.log(token);
    //this.checkTokenExpiryTime();
    //this.isValid = true;
  }

  getToken(){
    return this.authToken = localStorage.getItem('id_token');
  }

  getLuser(){
    if(localStorage.getItem('user')){
    return this.user = JSON.parse(localStorage.getItem('user'));
    }else{
      if(this.loggedIn()){
        this.updateUser(this.jwtHelper.decodeToken(this.getToken()).userX);
        return this.user;// = JSON.parse(localStorage.getItem('user'));
      }else{
        localStorage.clear();
        return false;
      }
    }
  }

  checkTokenExpiryTime(){
      if(this.getToken() != null){
        this.tknExpTime = ((this.jwtHelper.decodeToken(this.getToken()).exp) - (Date.now()/ 1000) - this.tknExpNtfyTime/1000)*1000;
      //this.tknExpTime = ((this.jwtHelper.decodeToken(this.getToken()).exp) - (this.jwtHelper.decodeToken(this.getToken()).iat) - this.tknExpNtfyTime/1000)*1000;
      //console.log(this.tknExpTime, "EXP: ", (this.jwtHelper.decodeToken(this.getToken()).exp), "NOW: ", Date.now() / 1000,"To EXP: ",((this.jwtHelper.decodeToken(this.getToken()).exp)- (Date.now() / 1000)));
    }
  }

  getExpNtfTime(){
    if(this.getToken() != null){
      let exp = ( (this.jwtHelper.decodeToken(localStorage.getItem('id_token')).exp)- (Date.now() / 1000) );
      //return exp <= 60 ? `${Math.floor(exp)} Seconds` : `${Math.floor(exp/60)} minute ${Math.floor((exp)/60-(Math.floor((exp)/60)))} Seconds`;
      return exp <= 60 ? `${Math.floor(exp)} Seconds` : `${Math.floor(exp / 60)} Minute : ${Math.floor(exp % 60)} Seconds`;
    }return false;
  }

  updateUser(user){
    this.user = {id: user._id, name: user.name, username:user.username, email:user.email, permission: user.permission};
    localStorage.removeItem('user');
    localStorage.setItem('user', JSON.stringify(this.user));
    this.permission = this.user.permission;
    //this.getLuser();
  }

  resetPassword(id){
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.getToken());
    return this.http.post(`${this.api}/api/reset`,id, {headers: headers})
      .map(res=> res.json());
  }

  confirmNewPwdToken(token){
    return this.http.get(`${this.api}/api/newpassword/${token}`)
      .map(res=> res.json());
  }

  setNewPassword(id, pwd){
    //console.log("id : ",id ,"password : ",pwd);
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.put(`${this.api}/api/setnewpwd/${id}`,{password: pwd}, {headers: headers})
      .map(res=> res.json());
  }

  trackSession(){
    let pres = null;
    let fres = null;
    let c = 1;//console.log("Count :A: ", c);
    if(this.sessionSub == undefined){
      this.sessionSub = this.sc.validate().subscribe((res) => {
        pres == null ? pres=res : pres=pres;
        fres = res;
        //console.log("Count: ", c, "res: ", res, ", pres: ",pres, ", fres: ", fres);
        if(!res){
          if(pres != fres){
            if(!this.islogOutBtn){
              $("#idleModal").modal('hide');
              $("#tknModal").modal('hide');
              $("#myModal").modal('show');
            }
            //console.log("session expired");
          }
        }
        pres = fres;c++;
        //if(this.getToken() == null) this.sessionSub.unsubscribe();
      });
    }
  }

  trackIdle(){
    this.sc.eventHandeler();
    if(this.idleSub == undefined){
      this.idleSub = this.sc.idleChecker().subscribe((res) => {
        if(res){
          if(!$('#tknModal').is(':visible') && !$('#myModal').is(':visible')){
            $("#idleModal").modal('show');
              // console.log("session idle");
          }
        }
        if(this.getToken() == null) this.idleSub.unsubscribe();
      });
    }
  }

  trackTokenAlive(){
    //console.log(this.tokenTimeout);
    this.checkTokenExpiryTime();
    if(this.tokenTimeout == undefined || this.tokenTimeout == 'complete'){
      this.tokenTimeout = setTimeout(()=>{
        if(!$('#myModal').is(':visible')){
          $("#idleModal").modal('hide');
          if(this.getToken() != null)
          $("#tknModal").modal('show');
          this.tokenTimeout = 'complete';
        }
      }, this.tknExpTime);
      this.tokenTimeout = '';
    }
  }

  getPermission(){
    const id = this.jwtHelper.decodeToken(this.getToken()).userX.username;
    return this.http.get(`${this.api}/api/user/permission/${id}`)
      .map(res=> res.json());
  }

  getAllUsers(){
    const username = this.jwtHelper.decodeToken(this.getToken()).userX.username;
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(`${this.api}/api/getusers`,{username:username}, {headers: headers})
      .map(res=> res.json());
  }

  deleteUserAPI(id){
    const username = this.jwtHelper.decodeToken(this.getToken()).userX.username;
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(`${this.api}/api/deleteuser/${id}`,{username:username}, {headers: headers})
      .map(res=> res.json());
  }

  setUserRole(){
    this.getPermission().subscribe(role=> {
      this.permission = role.permission;
    },err=>{
      this.permission = '';
    });
  }

  canMngRole(){
    if(this.permission){
      return (this.permission == 'admin' || this.permission == 'moderator') ? true : false;
    }else{
      return false;
    }
  }

  getUserDetailAPI(id){
    return this.http.get(`${this.api}/api/users/${id}`)
      .map(res=> res.json());
  }

  refreshLocalUser(){
    if(!this.islogOutBtn){
      this.getProfileAPI().subscribe(profile =>{
        if(profile.success){
          this.updateUser(profile.user);
        }else{
          return false;
        }
      },err=>{
        //localStorage.clear();
        return false;
      });
    }
  }

  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
    this.islogOutBtn = true;
    this.permission = '';
    //this.isValid = false;
  }

}
