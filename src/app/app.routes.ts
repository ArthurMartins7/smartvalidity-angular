import { Routes } from '@angular/router';
import { AlertaEditarComponent } from './components/alerta/alerta-editar/alerta-editar.component';
import { AlertaListagemComponent } from './components/alerta/alerta-listagem/alerta-listagem.component';
import { CategoriaDetalheComponent } from './components/categoria/categoria-detalhe/categoria-detalhe/categoria-detalhe.component';
import { CategoriaEditarComponent } from './components/categoria/categoria-editar/categoria-editar/categoria-editar.component';
import { CorredorDetalheComponent } from './components/corredor/corredor-detalhe/corredor-detalhe.component';
import { CorredorEditarComponent } from './components/corredor/corredor-editar/corredor-editar/corredor-editar.component';
import { CorredorListagemComponent } from './components/corredor/corredor-listagem/corredor-listagem.component';
import { EntradaEstoqueComponent } from './components/entrada-estoque/entrada-estoque.component';
import { FornecedorDetalheComponent } from './components/fornecedor/fornecedor-detalhe/fornecedor-detalhe.component';
import { FornecedorEditarComponent } from './components/fornecedor/fornecedor-editar/fornecedor-editar/fornecedor-editar.component';
import { FornecedorListagemComponent } from './components/fornecedor/fornecedor-listagem/fornecedor-listagem/fornecedor-listagem.component';
import { MuralDetalheComponent } from './components/mural/mural-detalhe/mural-detalhe.component';
import { MuralListagemComponent } from './components/mural/mural-listagem/mural-listagem.component';
import { ProdutoEditarComponent } from './components/produto/produto-editar/produto-editar/produto-editar.component';
import { ProdutoDetalheComponent } from './components/produto/produto-listagem/produto-detalhe/produto-detalhe/produto-detalhe.component';
import { ProdutoListagemComponent } from './components/produto/produto-listagem/produto-listagem.component';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'corredor', component: CorredorListagemComponent },
  { path: 'corredor-detalhe', component: CorredorDetalheComponent },
  { path: 'corredor-editar/:id', component: CorredorEditarComponent },
  { path: 'produto-listagem', component: ProdutoListagemComponent },
  { path: 'produto-detalhe', component: ProdutoDetalheComponent },
  { path: 'produto-editar', component: ProdutoEditarComponent },
  { path: 'fornecedor-listagem', component: FornecedorListagemComponent },
  { path: 'fornecedor-detalhe', component: FornecedorDetalheComponent },
  { path: 'fornecedor-editar/:id', component: FornecedorEditarComponent },
  { path: 'entrada-estoque', component: EntradaEstoqueComponent },

  // Rotas de Alertas
  { path: 'alertas', component: AlertaListagemComponent },
  { path: 'alerta-editar', component: AlertaEditarComponent },
  { path: 'alerta-editar/:id', component: AlertaEditarComponent },

  // Rotas do Mural
  { path: 'mural-listagem', component: MuralListagemComponent },
  { path: 'mural-detalhe/:id', component: MuralDetalheComponent },

  { path: 'categoria-detalhe', component: CategoriaDetalheComponent },
  { path: 'categoria-editar', component: CategoriaEditarComponent },

];
