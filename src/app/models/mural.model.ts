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
  lote: string;
  status: 'proximo' | 'hoje' | 'vencido';
}
