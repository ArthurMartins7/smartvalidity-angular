import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../shared/service/usuario.service';
import { EmpresaService } from '../../../shared/service/empesa.service';
import { AuthenticationService } from '../../../core/auth/services/auth.service';
import { Usuario } from '../../../shared/model/entity/usuario.model';
import { Empresa } from '../../../shared/model/entity/empresa';

@Component({
  selector: 'app-minha-conta-info',
  templateUrl: './minha-conta-info.component.html',
  styleUrls: ['./minha-conta-info.component.css']
})
export class MinhaContaInfoComponent implements OnInit {



  private router = inject(Router);
  private usuarioService = inject(UsuarioService);
  private empresaService = inject(EmpresaService);
  private authService = inject(AuthenticationService);

  public usuarioLogado: Usuario = new Usuario();
  public empresa: Empresa = new Empresa();

  ngOnInit(): void {
    this.buscarUsuarioLogado();
  }

  public buscarUsuarioLogado(): void {
    this.authService.getCurrentUser().subscribe((usuario) => {
      this.usuarioLogado = usuario;
      console.log(this.usuarioLogado);
      this.buscarEmpresa();
    });
  }

  public buscarEmpresa(): void {
    this.empresaService.buscarPorId(this.usuarioLogado.empresa.id).subscribe((empresa) => {
      this.empresa = empresa;
    });
  }

  editarPerfil(): void {
    this.router.navigate(['/minha-conta-editar']);
  }

  alterarSenha(): void {
    this.router.navigate(['/alterar-senha']);
  }
}
