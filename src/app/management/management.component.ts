import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FilterPipe } from '../filter.pipe';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {

  Math;
  user: { id: String, name: String,username: String,email: String, permission: String};
  bckUsers;
  users;
  canEdit: boolean = false;
  canDelete: boolean = false;
  usersCount;
  listStart = 0;
  listEnd;
  listLimit;
  validInp = true;
  listPages = [];
  listActivePage;
  listSearch;
  listSortAsc;
  

  constructor(private as: AuthService, private rt: Router) { 
    this.Math = Math;
  }

  ngOnInit() {
    if(this.as.isNewlyLoaded){
    this.rt.navigate(['/profile']);
    }
    this.user = this.as.user;
    this.users = this.loadUsers();
  }

  loadUsers(){
    this.as.getAllUsers().subscribe(result =>{
      if(result.success){
        this.bckUsers = this.users = result.users;//console.log(this.bckUsers);
        this.usersCount = this.listEnd = this.listLimit = this.users.length;
        this.listPages = [{index: 0, listStart: 0, listEnd: this.usersCount }];
        this.listActivePage = 0;
        if(this.user.permission == 'admin'){
          this.canDelete = true;
          this.canEdit = true;          
        }if(this.user.permission == 'moderator'){
          this.canDelete = false;
          this.canEdit = true;
        }
        
      }else{
        //localStorage.clear();
      }
    },err=>{
      return false;
    });
  }

  applyFilter(){
    if((parseFloat(this.listLimit) == parseInt(this.listLimit)) && !isNaN(this.listLimit) && this.listLimit>0 && this.users.length>0) {
      //console.log("fl: ", this.listLimit);
      //this.listStart = 0;
      //this.listEnd = this.listStart + this.listLimit;
      this.validInp = true;
      this.usersCount = this.users.length;
      this.listPaging(this.usersCount, this.listLimit);
      //console.log(this.listPages);
      this.listStart = this.listPages[0].listStart;
      this.listEnd = this.listPages[0].listEnd;
      this.listActivePage = this.listPages[0].index;
    }else{
      this.validInp = false;
    }
  }

  removeFilter(){
      this.listStart = 0;
      this.listEnd = this.listLimit = this.users.length;
      this.listPages = [{index: 0, listStart: 0, listEnd: this.listEnd }];
      this.listActivePage = this.listPages[0].index;
      this.validInp = true;
      if(this.listSearch==undefined || this.listSearch =='') this.clear();
  }

  listPaging(end, limit){
    this.listPages = [];
    let arrLen = (end% limit == 0) ? Math.floor(end/ limit) : Math.floor(end/ limit) + 1;
    console.log(end, limit, arrLen);
    let first = 0;
    for(let i=arrLen; i>0; i--){
      this.listPages.push({
        index: arrLen - i,
        listStart: first,
        listEnd: (first + limit) > end ? (first +(end% limit)) : (first + limit)
      }); 
      first = first + limit;
    }
  }

  nagivatePage(index){
    this.listStart = this.listPages[index].listStart;
    this.listEnd = this.listPages[index].listEnd;
    this.listActivePage = index;
  }

  deleteUser(user){
    if(window.confirm(`Are sure you want to delete User : ${user.username} ?`)){
      this.as.deleteUserAPI(user._id).subscribe(result =>{
        if(result.success){
          // let filterSize = this.listLimit;
          // this.loadUsers();   
          // this.listLimit = filterSize;  console.log(filterSize, 'LL : ', this.listLimit);
          const index = this.users.indexOf(result.user);
          this.users.splice(index, 1); 
          this.bckUsers = this.users;
          this.applyFilter();
        }else{
          return false;
        }
      },err=>{
        return false;
      });
     }
  }

  clear(){
    this.listSearch = undefined;
    this.users = this.bckUsers;
    this.applyFilter();
    if(this.listLimit ==0 ) this.removeFilter();
  }

  search(){
    this.users = this.bckUsers;
    if(this.listSearch == undefined || this.listSearch ==''){
      this.validInp = false;
      return false;
    }
    else{
      this.validInp = true;
      this.users = this.users.filter((obj)=>{
        return obj.name.toLowerCase().includes(this.listSearch.toLowerCase());
      });
    }
    this.applyFilter();
  }

  listSort(val){
    if(this.listSortAsc){
      this.listSortAsc = !this.listSortAsc;
    }else{
      this.listSortAsc = true;
    }
    //username
    if(this.listSortAsc){
      this.users.sort(function(obj1, obj2) {
        // Ascending: first less than the previous
        if(obj1[val] < obj2[val]) return -1;
        if(obj1[val] > obj2[val]) return 1;
        return 0;
      });
    }else{
      this.users.sort(function(obj1, obj2) {
        // Descending: first greater than the previous
        if(obj1[val] < obj2[val]) return 1;
        if(obj1[val] > obj2[val]) return -1;
        return 0;
      });
    }    

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
