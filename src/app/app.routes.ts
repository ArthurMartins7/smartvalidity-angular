import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';
import { CorredorListagemComponent } from './components/corredor/corredor-listagem/corredor-listagem.component';
import { CorredorDetalheComponent } from './components/corredor/corredor-detalhe/corredor-detalhe.component';
import { ProdutoListagemComponent } from './components/produto/produto-listagem/produto-listagem.component';
import { MuralListagemComponent } from './components/mural/mural-listagem/mural-listagem.component';
import { MuralDetalheComponent } from './components/mural/mural-detalhe/mural-detalhe.component';

export const routes: Routes = [
  // Auth routes (without sidebar)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Main routes (with sidebar)
  { path: 'corredor', component: CorredorListagemComponent },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'produto-listagem', component: ProdutoListagemComponent },
  { path: '', redirectTo: 'produto-listagem', pathMatch: 'full' },

  // Catch all route
  { path: '**', redirectTo: 'login' },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'mural-listagem', component: MuralListagemComponent },
  { path: 'mural-detalhe', component: MuralDetalheComponent }
];
