import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';
import { CorredorListagemComponent } from './components/corredor/corredor-listagem/corredor-listagem.component';
import { CorredorDetalheComponent } from './components/corredor/corredor-detalhe/corredor-detalhe.component';
import { MuralListagemComponent } from './components/mural/mural-listagem/mural-listagem.component';
import { MuralDetalheComponent } from './components/mural/mural-detalhe/mural-detalhe.component';


export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'corredor', component: CorredorListagemComponent },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'mural-listagem', component: MuralListagemComponent }
  { path: 'mural-detalhe', component: MuralDetalheComponent },
];
