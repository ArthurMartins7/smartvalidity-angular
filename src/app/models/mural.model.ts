export interface MuralItem {
  id: string;
  itemProduto: string;
  produto: {
    id: string;
    nome: string;
    descricao: string;
    codigoBarras: string;
    marca: string;
    unidadeMedida: string;
  };
  categoria: string;
  corredor: string;
  fornecedor: string;
  dataValidade: Date;
  dataFabricacao?: Date;
  dataRecebimento?: Date;
  lote: string;
  precoVenda?: number;
  status: 'proximo' | 'hoje' | 'vencido';
  inspecionado: boolean;
  motivoInspecao?: string;
  selecionado?: boolean; // Para controle de seleção no frontend
}
