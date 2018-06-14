import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/interval';
import {Observable, Subject} from 'rxjs/Rx';


@Injectable()
export class SessionCheckService {

  constructor( private jwtHelper: JwtHelper){};

  intrvl: number = 1000;
  public configObservable = new Subject<boolean>();
  allEvents$;
  idleTimeout: number = 5*1000; //check for idle in every ..mili seconds
  idleTimeoutCountConst: number = 5*60*1000;  //max idle time in ..mili seconds
  idleTimeoutCountTemp: number = this.idleTimeoutCountConst;
  isIdle: boolean = false;
  eventSub;

  public validate(): Observable < any > {
    if(localStorage.getItem('id_token') != null){
      return Observable.interval(this.intrvl)
        .map( (x) => this.valiadteHelper(localStorage.getItem('id_token')) );
        //.filter(resp => this.valiadteHelper(token));
    }
  }

  valiadteHelper(token){    
    if(localStorage.getItem('id_token') != null){
      if(!this.jwtHelper.isTokenExpired(token)) return true;  
      else return false;
    }else {
      return false;
    }    
  }

  emitConfig(val) {
    this.configObservable.next(val); 
  }

  eventHandeler(){
    const eventNames = ['scroll', 'wheel', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup', 'keydown', 'keyup', 'click'];

    const eventStreams = eventNames.map((eventName) => {
        return Observable.fromEvent(window, eventName);
    });

    this.allEvents$ = Observable.merge(...eventStreams);

    //console.log(this.eventSub);
    if(this.eventSub == undefined){
      this.eventSub = this.allEvents$.subscribe((event) => {
        if(event){
          this.idleTimeoutCountTemp = this.idleTimeoutCountConst;
          //console.log("event: ", event);
        }
      });
    }
  //   let mouse = Observable.fromEvent(document, 'mousemove');
  //   const md = Observable.fromEvent(document, 'mousedown');
  //   const kd = Observable.fromEvent(document, 'keydown');
  //   const allEvents$ = Observable.merge(md,kd,mouse);
  //   allEvents$.subscribe((event) => {
  //        console.log(event);
  //  });
  }
  
  idleChecker(){
    return Observable.interval(this.idleTimeout)
      .map( (x) => {
        this.idleTimeoutCountTemp = this.idleTimeoutCountTemp - this.idleTimeout;
        //console.log(this.idleTimeoutCountTemp);
        if(this.idleTimeoutCountTemp <= 1000) return this.isIdle = true;
        else return this.isIdle = false;
      });
  }

}
