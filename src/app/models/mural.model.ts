export interface MuralItem {
  id: number;
  itemProduto: string;
  produto: {
    id: number;
    nome: string;
    descricao: string;
  };
  categoria: string;
  corredor: string;
  fornecedor: string;
  dataValidade: Date;
  lote: string;
  status: 'proximo' | 'hoje' | 'vencido';
}
