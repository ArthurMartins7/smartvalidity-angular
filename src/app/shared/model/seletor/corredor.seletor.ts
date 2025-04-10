import { BaseSeletor } from './base.seletor';

export class CorredorSeletor extends BaseSeletor {
  nome: string = '';
  responsavel: string = '';
  responsavelId: string | null = null;
  override pagina: number = 1;
  override limite: number = 5;
}
