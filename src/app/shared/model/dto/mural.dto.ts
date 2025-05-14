/**
 * DTOs relacionados ao mural de validade
 */

/**
 * DTO para a listagem de produtos no mural de validade
 */
export interface MuralListagemDTO {
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
  usuarioInspecao?: string;
  dataHoraInspecao?: Date;
  selecionado?: boolean; // Para controle de seleção no frontend
}

/**
 * DTO para os filtros do mural de validade
 */
export interface MuralFiltroDTO {
  corredor?: string;
  categoria?: string;
  fornecedor?: string;
  marca?: string;
  lote?: string;
  dataVencimentoInicio?: string; // ISO string
  dataVencimentoFim?: string; // ISO string
  dataFabricacaoInicio?: string; // ISO string
  dataFabricacaoFim?: string; // ISO string
  dataRecebimentoInicio?: string; // ISO string
  dataRecebimentoFim?: string; // ISO string
  inspecionado?: boolean | null;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: 'proximo' | 'hoje' | 'vencido'; // Status da validade do produto
  pagina?: number; // Página atual
  limite?: number; // Quantidade de itens por página
}
