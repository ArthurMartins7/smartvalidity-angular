import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { MuralListagemDTO } from '../model/dto/mural.dto';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  constructor() { }

  /**
   * Gera um relatório Excel a partir dos dados de mural
   * @param items Itens do mural para incluir no relatório
   * @param tituloRelatorio Título do relatório
   */
  async gerarRelatorioExcel(items: MuralListagemDTO[], tituloRelatorio: string): Promise<void> {
    // Criar uma nova workbook
    const workbook = new ExcelJS.Workbook();

    // Adicionar uma planilha
    const worksheet = workbook.addWorksheet('Relatório de Produtos');

    // Configurar cabeçalho com título e data atual
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = tituloRelatorio;
    titleCell.font = {
      size: 16,
      bold: true
    };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:G2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Gerado em: ${new Date().toLocaleString()}`;
    dateCell.font = { italic: true };
    dateCell.alignment = { horizontal: 'center' };

    // Adicionar linha em branco para separação
    worksheet.addRow([]);

    // Adicionar cabeçalhos da tabela
    const headers = [
      'Código de Barras',
      'Lote',
      'Descrição',
      'Marca',
      'Data de Vencimento',
      'Status',
      'Inspecionado'
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F81BD' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };
    });

    // Adicionar dados
    items.forEach(item => {
      const row = worksheet.addRow([
        item.produto?.codigoBarras || '',
        item.lote || '',
        item.produto?.descricao || '',
        item.produto?.marca || '',
        item.dataValidade ? new Date(item.dataValidade).toLocaleString() : '',
        this.getStatusFormatado(item.status),
        item.inspecionado ? 'Sim' : 'Não'
      ]);

      // Colorir linha de acordo com o status
      const statusCell = row.getCell(6);
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: this.getStatusColor(item.status)
        }
      };
    });

    // Ajustar larguras das colunas para o conteúdo
    if (worksheet.columns) {
      for (const column of worksheet.columns) {
        if (column) {
          let maxLength = 0;
          (column as ExcelJS.Column).eachCell({ includeEmpty: true }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        }
      }
    }

    // Exportar para arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `relatorio_${this.formatarDataArquivo(new Date())}.xlsx`);
  }

  /**
   * Formata a data para uso em nome de arquivo
   */
  private formatarDataArquivo(data: Date): string {
    return data.toISOString().split('T')[0].replace(/-/g, '_');
  }

  /**
   * Retorna o texto formatado do status
   */
  private getStatusFormatado(status: string): string {
    switch (status) {
      case 'proximo': return 'Próximo a vencer';
      case 'hoje': return 'Vence hoje';
      case 'vencido': return 'Vencido';
      default: return status;
    }
  }

  /**
   * Retorna a cor para o status
   */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'proximo': return 'FFF2CC'; // Amarelo claro
      case 'hoje': return 'FCE4D6'; // Laranja claro
      case 'vencido': return 'F8CBAD'; // Vermelho claro
      default: return 'FFFFFF'; // Branco
    }
  }
}
