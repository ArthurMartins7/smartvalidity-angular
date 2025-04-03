import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';
import { CorredorListagemComponent } from './components/corredor/corredor-listagem/corredor-listagem.component';
import { CorredorDetalheComponent } from './components/corredor/corredor-detalhe/corredor-detalhe.component';
import { ProdutoListagemComponent } from './components/produto/produto-listagem/produto-listagem.component';
import { CorredorEditarComponent } from './components/corredor/corredor-editar/corredor-editar/corredor-editar.component';
import { FornecedorListagemComponent } from './components/fornecedor/fornecedor-listagem/fornecedor-listagem/fornecedor-listagem.component';
import { FornecedorDetalheComponent } from './components/fornecedor/fornecedor-listagem/fornecedor-detalhe/fornecedor-detalhe.component';

export const routes: Routes = [
  // Auth routes (without sidebar)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Main routes (with sidebar)
  { path: 'corredor', component: CorredorListagemComponent },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'corredor-editar', component: CorredorEditarComponent },
  { path: 'produto-listagem', component: ProdutoListagemComponent },
  { path: 'fornecedor-listagem', component: FornecedorListagemComponent },
  { path: 'fornecedor-detalhe', component: FornecedorDetalheComponent },
  { path: '', redirectTo: 'produto-listagem', pathMatch: 'full' },

  // Catch all route
  { path: '**', redirectTo: 'login' }
];
