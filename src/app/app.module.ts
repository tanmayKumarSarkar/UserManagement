import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FlashMessagesModule } from 'angular2-flash-messages';

import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';

import { FlashMessagesService } from 'angular2-flash-messages';
import { ValidateService } from './services/validate.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './auth.guard';
import { ActivateComponent } from './activate/activate.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { SessionCheckService } from './services/session-check.service';
import { JwtHelper } from 'angular2-jwt';
import { ModalComponent } from './modal/modal.component';
import { ManagementComponent } from './management/management.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { FilterPipe } from './filter.pipe';


const appRoutes = [
  {path: '', component: HomeComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'confirmation/:token', component: ActivateComponent},
  {path: 'reset', component: ResetPasswordComponent},
  {path: 'new/:token', component: NewPasswordComponent},
  {path: 'management', component: ManagementComponent, canActivate: [AuthGuard]},
  {path: 'user/edit/:id', component: EditUserComponent, canActivate: [AuthGuard]},
  {path: '**', redirectTo: '', terminal: true}
];

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent,
    ProfileComponent,
    ActivateComponent,
    ResetPasswordComponent,
    NewPasswordComponent,
    ModalComponent,
    ManagementComponent,
    EditUserComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    HttpModule,
    FlashMessagesModule   
  ],
  providers: [
    ValidateService,
    FlashMessagesService,
    AuthService,
    AuthGuard,
    SessionCheckService,
    JwtHelper
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
