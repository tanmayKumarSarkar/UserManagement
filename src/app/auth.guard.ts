import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private as: AuthService, private router: Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if(this.as.loggedIn()){
      if(state.url == '/profile'){
      return true;
      }
      else if(state.url == '/management'){
        if(this.as.permission == 'admin' || this.as.permission == 'moderator'){
          return true;
        }else{
          if(this.as.permission == undefined || this.as.permission == ''){
            this.router.navigate(['/profile']);
            return true;
          }
          return false;
        }
      }else if(state.url.startsWith("/user/edit/")){
        if(this.as.permission == 'admin' || this.as.permission == 'moderator'){console.log("s1",this.as.permission);
          return true;
        }else{console.log("S2",this.as.permission);
          if(this.as.permission == undefined || this.as.permission == ''){console.log("s3",this.as.permission);
            this.router.navigate(['/profile']);
            return true;
          }
          return false;
        }
      }
      else{ 
        return false;
      }
    }
    else{
      this.router.navigate(['/login']);
      return false;
    }
  }
}
