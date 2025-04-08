import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';
import { CorredorListagemComponent } from './components/corredor/corredor-listagem/corredor-listagem.component';
import { CorredorDetalheComponent } from './components/corredor/corredor-detalhe/corredor-detalhe.component';
import { ProdutoListagemComponent } from './components/produto/produto-listagem/produto-listagem.component';
import { EntradaEstoqueComponent } from './components/entrada-estoque/entrada-estoque.component';
import { CorredorEditarComponent } from './components/corredor/corredor-editar/corredor-editar/corredor-editar.component';
import { FornecedorListagemComponent } from './components/fornecedor/fornecedor-listagem/fornecedor-listagem/fornecedor-listagem.component';
import { CategoriaDetalheComponent } from './components/categoria/categoria-detalhe/categoria-detalhe/categoria-detalhe.component';
import { FornecedorEditarComponent } from './components/fornecedor/fornecedor-editar/fornecedor-editar/fornecedor-editar.component';
import { FornecedorDetalheComponent } from './components/fornecedor/fornecedor-detalhe/fornecedor-detalhe.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'corredor', component: CorredorListagemComponent },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'corredor-editar', component: CorredorEditarComponent },
  { path: 'produto-listagem', component: ProdutoListagemComponent },
  { path: 'fornecedor-listagem', component: FornecedorListagemComponent },
  { path: 'fornecedor-detalhe', component: FornecedorDetalheComponent },
  { path: 'fornecedor-editar/:id', component: FornecedorEditarComponent },
  { path: 'entrada-estoque', component: EntradaEstoqueComponent },
  { path: 'categoria-detalhe', component: CategoriaDetalheComponent },

];
