import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';
import { CorredorListagemComponent } from './components/corredor/corredor-listagem/corredor-listagem.component';
import { CorredorDetalheComponent } from './components/corredor/corredor-detalhe/corredor-detalhe.component';
import { ProdutoListagemComponent } from './components/produto/produto-listagem/produto-listagem.component';
import { CorredorEditarComponent } from './components/corredor/corredor-editar/corredor-editar/corredor-editar.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'corredor', component: CorredorListagemComponent },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'corredor-editar', component: CorredorEditarComponent },
  { path: 'produto-listagem', component: ProdutoListagemComponent },

];
