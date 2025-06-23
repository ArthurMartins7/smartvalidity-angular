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
  // Novos campos para múltiplos valores
  corredores?: string[];
  categorias?: string[];
  fornecedores?: string[];
  marcas?: string[];
  lotes?: string[];
  motivosInspecao?: string[];
  usuariosInspecao?: string[];

  // Campos legados para compatibilidade
  corredor?: string;
  categoria?: string;
  fornecedor?: string;
  marca?: string;
  lote?: string;
  motivoInspecao?: string;
  usuarioInspecao?: string;

  // Campos de data
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  dataFabricacaoInicio?: string;
  dataFabricacaoFim?: string;
  dataRecebimentoInicio?: string;
  dataRecebimentoFim?: string;

  // Outros campos
  inspecionado?: boolean;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: 'proximo' | 'hoje' | 'vencido';
  pagina?: number;
  limite?: number;
}
