import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
