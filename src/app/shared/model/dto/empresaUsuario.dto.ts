export class EmpresaUsuarioDto {

  cnpj: string;
  razaoSocial: string;
  nomeUsuario: string;
  email: string;
  senha: string;
  cargo: string;

  /**
   * Código de verificação enviado para o e-mail do usuário
   */
  token: string;
}
