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
import { MinhaContaEditarComponent } from './components/minha-conta/minha-conta-editar/minha-conta-editar.component';
import { MinhaContaInfoComponent } from './components/minha-conta/minha-conta-info/minha-conta-info.component';
import { ItemProdutoCadastroComponent } from './components/item-produto/item-produto-cadastro/item-produto-cadastro.component';
import { MuralDetalheComponent } from './components/mural/mural-detalhe/mural-detalhe.component';
import { MuralListagemComponent } from './components/mural/mural-listagem/mural-listagem.component';
import { NotificacaoListagemComponent } from './components/notificacao/notificacao-listagem.component';
import { ProdutoEditarComponent } from './components/produto/produto-editar/produto-editar/produto-editar.component';
import { ProdutoDetalheComponent } from './components/produto/produto-listagem/produto-detalhe/produto-detalhe/produto-detalhe.component';
import { ProdutoListagemComponent } from './components/produto/produto-listagem/produto-listagem.component';
import { UsuariosPerfisListagemComponent } from './components/usuarios-perfis/usuarios-perfis-listagem/usuarios-perfis-listagem.component';
import { UsuariosPerfisPendentesComponent } from './components/usuarios-perfis/usuarios-perfis-pendentes/usuarios-perfis-pendentes.component';
import { LoginComponent } from './core/auth/pages/login/login/login.component';
import { RegisterComponent } from './core/auth/pages/register/register/register.component';
import { SignupInfoPessoaisComponent } from './core/auth/pages/signup/signup-info-pessoais/signup-info-pessoais.component';
import { SignupSenhaComponent } from './core/auth/pages/signup/signup-senha/signup-senha.component';
import { SignupVerificacaoComponent } from './core/auth/pages/signup/signup-verificacao/signup-verificacao.component';
import { SignupValidarIdentidadeComponent } from './core/auth/pages/signup/signup-validar-identidade/signup-validar-identidade.component';
import { SigninComponent } from './core/auth/pages/signin/signin.component';

export const routes: Routes = [
  //{ path: 'login', component: LoginComponent },
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
  { path: 'item-produto-cadastro', component: ItemProdutoCadastroComponent },
  { path: 'usuarios-perfis-listagem', component: UsuariosPerfisListagemComponent },
  { path: 'usuarios-perfis-pendentes', component: UsuariosPerfisPendentesComponent },
  { path: 'minha-conta-info', component: MinhaContaInfoComponent },
  { path: 'minha-conta-editar', component: MinhaContaEditarComponent },

  // Rotas de Alertas
  { path: 'alertas', component: AlertaListagemComponent },
  { path: 'alerta-editar', component: AlertaEditarComponent },
  { path: 'alerta-editar/:id', component: AlertaEditarComponent },

  // Rotas de Notificações
  { path: 'notificacoes', component: NotificacaoListagemComponent },

  // Rotas do Mural
  { path: 'mural-listagem', component: MuralListagemComponent },
  { path: 'mural-detalhe/:id', component: MuralDetalheComponent },

  { path: 'categoria-detalhe', component: CategoriaDetalheComponent },
  { path: 'categoria-editar', component: CategoriaEditarComponent },

  // Rotas de Sign Up e Sign In
  { path: '', component: SigninComponent },
  { path: 'signup-info-pessoais', component: SignupInfoPessoaisComponent },
  { path: 'signup-senha', component: SignupSenhaComponent },
  { path: 'signup-verificacao', component: SignupVerificacaoComponent },
  { path: 'signup-validar-identidade', component: SignupValidarIdentidadeComponent },
];
