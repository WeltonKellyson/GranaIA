import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  GastoResponse,
  ReceitaResponse,
  GastoDashboard,
  ReceitaDashboard,
} from '../services/api';

interface ExcelExportButtonProps {
  gastos: GastoResponse[];
  receitas: ReceitaResponse[];
  gastoDashboard: GastoDashboard | null;
  receitaDashboard: ReceitaDashboard | null;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  transacoesFiltradas?: Array<{
    id: string;
    data: string;
    descricao: string;
    tipo: 'Receita' | 'Despesa';
    valor: number;
    categoria: string;
  }>;
  filtros?: {
    mes: string;
    categoria: string;
    tipo: string;
  };
}

export default function ExcelExportButton({
  gastos,
  receitas,
  gastoDashboard,
  receitaDashboard,
  totalReceitas,
  totalDespesas,
  saldo,
  transacoesFiltradas,
  filtros,
}: ExcelExportButtonProps) {
  const exportToExcel = async () => {
    // Aplicar filtros nas receitas e despesas
    const receitasFiltradas = receitas.filter((r) => {
      const data = r.data || r.created_at;
      const anoMes = data.slice(0, 7);

      const filtroMesOK = filtros?.mes ? anoMes === filtros.mes : true;
      const filtroCategoriaOK = filtros?.categoria === 'todas' || !filtros?.categoria
        ? true
        : r.categoria === filtros.categoria;
      const filtroTipoOK = filtros?.tipo === 'todos' || filtros?.tipo === 'Receita' || !filtros?.tipo
        ? true
        : false;

      return filtroMesOK && filtroCategoriaOK && filtroTipoOK;
    });

    const gastosFiltrados = gastos.filter((g) => {
      const data = g.data || g.created_at;
      const anoMes = data.slice(0, 7);

      const filtroMesOK = filtros?.mes ? anoMes === filtros.mes : true;
      const filtroCategoriaOK = filtros?.categoria === 'todas' || !filtros?.categoria
        ? true
        : g.categoria === filtros.categoria;
      const filtroTipoOK = filtros?.tipo === 'todos' || filtros?.tipo === 'Despesa' || !filtros?.tipo
        ? true
        : false;

      return filtroMesOK && filtroCategoriaOK && filtroTipoOK;
    });

    // Recalcular totais baseados nos dados filtrados
    const totalReceitasFiltradas = receitasFiltradas.reduce((sum, r) => sum + parseFloat(r.valor), 0);
    const totalDespesasFiltradas = gastosFiltrados.reduce((sum, g) => sum + parseFloat(g.valor), 0);
    const saldoFiltrado = totalReceitasFiltradas - totalDespesasFiltradas;

    // Criar workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GranaIA';
    workbook.created = new Date();

    // ===== ABA 1: RESUMO =====
    const wsResumo = workbook.addWorksheet('Resumo', {
      views: [{ showGridLines: false }],
    });

    // Título principal
    wsResumo.mergeCells('A1:C1');
    const titleCell = wsResumo.getCell('A1');
    titleCell.value = 'RESUMO FINANCEIRO';
    titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' }, // Verde
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsResumo.getRow(1).height = 30;

    // Cabeçalhos da tabela de resumo
    wsResumo.getCell('A3').value = 'Indicador';
    wsResumo.getCell('B3').value = 'Valor';
    const headerRow = wsResumo.getRow(3);
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }, // Cinza claro
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Dados do resumo
    wsResumo.getCell('A4').value = 'Total de Receitas';
    wsResumo.getCell('B4').value = `R$ ${totalReceitasFiltradas.toFixed(2)}`;
    wsResumo.getCell('B4').font = { color: { argb: 'FF16A34A' }, bold: true };

    wsResumo.getCell('A5').value = 'Total de Despesas';
    wsResumo.getCell('B5').value = `R$ ${totalDespesasFiltradas.toFixed(2)}`;
    wsResumo.getCell('B5').font = { color: { argb: 'FFEF4444' }, bold: true };

    wsResumo.getCell('A6').value = 'Saldo Atual';
    wsResumo.getCell('B6').value = `R$ ${saldoFiltrado.toFixed(2)}`;
    wsResumo.getCell('B6').font = {
      color: { argb: saldoFiltrado >= 0 ? 'FF16A34A' : 'FFEF4444' },
      bold: true,
      size: 14,
    };

    // Bordas para a tabela de resumo
    for (let row = 3; row <= 6; row++) {
      for (let col = 1; col <= 2; col++) {
        const cell = wsResumo.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }
    }

    // Despesas por categoria
    let currentRow = 8;
    wsResumo.mergeCells(`A${currentRow}:C${currentRow}`);
    const despesasTitleCell = wsResumo.getCell(`A${currentRow}`);
    despesasTitleCell.value = 'DESPESAS POR CATEGORIA';
    despesasTitleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    despesasTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEF4444' }, // Vermelho
    };
    despesasTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsResumo.getRow(currentRow).height = 25;

    currentRow += 2;
    wsResumo.getCell(`A${currentRow}`).value = 'Categoria';
    wsResumo.getCell(`B${currentRow}`).value = 'Total';
    wsResumo.getCell(`C${currentRow}`).value = 'Quantidade';
    const despesasHeaderRow = wsResumo.getRow(currentRow);
    despesasHeaderRow.font = { bold: true };
    despesasHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    despesasHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

    currentRow++;
    const startDespesasData = currentRow;
    if (gastoDashboard?.por_categoria) {
      gastoDashboard.por_categoria.forEach((cat) => {
        wsResumo.getCell(`A${currentRow}`).value = cat.categoria;
        wsResumo.getCell(`B${currentRow}`).value = `R$ ${parseFloat(cat.total).toFixed(2)}`;
        wsResumo.getCell(`C${currentRow}`).value = cat.quantidade;
        currentRow++;
      });
    }

    // Bordas para despesas por categoria
    for (let row = startDespesasData - 1; row < currentRow; row++) {
      for (let col = 1; col <= 3; col++) {
        const cell = wsResumo.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    // Receitas por categoria
    currentRow += 2;
    wsResumo.mergeCells(`A${currentRow}:C${currentRow}`);
    const receitasTitleCell = wsResumo.getCell(`A${currentRow}`);
    receitasTitleCell.value = 'RECEITAS POR CATEGORIA';
    receitasTitleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    receitasTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' }, // Verde
    };
    receitasTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsResumo.getRow(currentRow).height = 25;

    currentRow += 2;
    wsResumo.getCell(`A${currentRow}`).value = 'Categoria';
    wsResumo.getCell(`B${currentRow}`).value = 'Total';
    wsResumo.getCell(`C${currentRow}`).value = 'Quantidade';
    const receitasHeaderRow = wsResumo.getRow(currentRow);
    receitasHeaderRow.font = { bold: true };
    receitasHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' },
    };
    receitasHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };

    currentRow++;
    const startReceitasData = currentRow;
    if (receitaDashboard?.por_categoria) {
      receitaDashboard.por_categoria.forEach((cat) => {
        wsResumo.getCell(`A${currentRow}`).value = cat.categoria;
        wsResumo.getCell(`B${currentRow}`).value = `R$ ${parseFloat(cat.total).toFixed(2)}`;
        wsResumo.getCell(`C${currentRow}`).value = cat.quantidade;
        currentRow++;
      });
    }

    // Bordas para receitas por categoria
    for (let row = startReceitasData - 1; row < currentRow; row++) {
      for (let col = 1; col <= 3; col++) {
        const cell = wsResumo.getCell(row, col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    // Larguras das colunas
    wsResumo.getColumn(1).width = 30;
    wsResumo.getColumn(2).width = 20;
    wsResumo.getColumn(3).width = 15;

    // ===== ABA 2: RECEITAS =====
    const wsReceitas = workbook.addWorksheet('Receitas', {
      views: [{ showGridLines: false }],
    });

    // Título
    wsReceitas.mergeCells('A1:E1');
    const receitasTitleMainCell = wsReceitas.getCell('A1');
    receitasTitleMainCell.value = 'RECEITAS';
    receitasTitleMainCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    receitasTitleMainCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' },
    };
    receitasTitleMainCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsReceitas.getRow(1).height = 30;

    // Cabeçalhos
    const receitasHeaders = ['Data', 'Descrição', 'Categoria', 'Origem', 'Valor'];
    receitasHeaders.forEach((header, idx) => {
      const cell = wsReceitas.getCell(3, idx + 1);
      cell.value = header;
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    wsReceitas.getRow(3).height = 25;

    // Dados
    const receitasOrdenadas = [...receitasFiltradas].sort(
      (a, b) =>
        new Date(b.data || b.created_at).getTime() - new Date(a.data || a.created_at).getTime()
    );

    let rowIdx = 4;
    receitasOrdenadas.forEach((r) => {
      const row = wsReceitas.getRow(rowIdx);
      row.getCell(1).value = new Date(r.data || r.created_at).toLocaleDateString('pt-BR');
      row.getCell(2).value = r.descricao;
      row.getCell(3).value = r.categoria;
      row.getCell(4).value = r.origem || '-';
      row.getCell(5).value = `R$ ${parseFloat(r.valor).toFixed(2)}`;
      row.getCell(5).font = { color: { argb: 'FF16A34A' }, bold: true };

      // Bordas e alinhamento
      for (let col = 1; col <= 5; col++) {
        const cell = row.getCell(col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      // Cor de fundo alternada
      if (rowIdx % 2 === 0) {
        for (let col = 1; col <= 5; col++) {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }

      rowIdx++;
    });

    // Total
    rowIdx++;
    wsReceitas.getCell(`A${rowIdx}`).value = 'TOTAL';
    wsReceitas.getCell(`A${rowIdx}`).font = { bold: true, size: 12 };
    wsReceitas.getCell(`E${rowIdx}`).value = `R$ ${totalReceitasFiltradas.toFixed(2)}`;
    wsReceitas.getCell(`E${rowIdx}`).font = { bold: true, size: 12, color: { argb: 'FF16A34A' } };

    // Larguras das colunas
    wsReceitas.getColumn(1).width = 12;
    wsReceitas.getColumn(2).width = 35;
    wsReceitas.getColumn(3).width = 20;
    wsReceitas.getColumn(4).width = 20;
    wsReceitas.getColumn(5).width = 15;

    // ===== ABA 3: DESPESAS =====
    const wsDespesas = workbook.addWorksheet('Despesas', {
      views: [{ showGridLines: false }],
    });

    // Título
    wsDespesas.mergeCells('A1:D1');
    const despesasTitleMainCell = wsDespesas.getCell('A1');
    despesasTitleMainCell.value = 'DESPESAS';
    despesasTitleMainCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    despesasTitleMainCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEF4444' },
    };
    despesasTitleMainCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsDespesas.getRow(1).height = 30;

    // Cabeçalhos
    const despesasHeaders = ['Data', 'Descrição', 'Categoria', 'Valor'];
    despesasHeaders.forEach((header, idx) => {
      const cell = wsDespesas.getCell(3, idx + 1);
      cell.value = header;
      cell.font = { bold: true, size: 12 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    wsDespesas.getRow(3).height = 25;

    // Dados
    const despesasOrdenadas = [...gastosFiltrados].sort(
      (a, b) =>
        new Date(b.data || b.created_at).getTime() - new Date(a.data || a.created_at).getTime()
    );

    rowIdx = 4;
    despesasOrdenadas.forEach((g) => {
      const row = wsDespesas.getRow(rowIdx);
      row.getCell(1).value = new Date(g.data || g.created_at).toLocaleDateString('pt-BR');
      row.getCell(2).value = g.descricao;
      row.getCell(3).value = g.categoria;
      row.getCell(4).value = `R$ ${parseFloat(g.valor).toFixed(2)}`;
      row.getCell(4).font = { color: { argb: 'FFEF4444' }, bold: true };

      // Bordas e alinhamento
      for (let col = 1; col <= 4; col++) {
        const cell = row.getCell(col);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      // Cor de fundo alternada
      if (rowIdx % 2 === 0) {
        for (let col = 1; col <= 4; col++) {
          row.getCell(col).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }

      rowIdx++;
    });

    // Total
    rowIdx++;
    wsDespesas.getCell(`A${rowIdx}`).value = 'TOTAL';
    wsDespesas.getCell(`A${rowIdx}`).font = { bold: true, size: 12 };
    wsDespesas.getCell(`D${rowIdx}`).value = `R$ ${totalDespesasFiltradas.toFixed(2)}`;
    wsDespesas.getCell(`D${rowIdx}`).font = { bold: true, size: 12, color: { argb: 'FFEF4444' } };

    // Larguras das colunas
    wsDespesas.getColumn(1).width = 12;
    wsDespesas.getColumn(2).width = 35;
    wsDespesas.getColumn(3).width = 20;
    wsDespesas.getColumn(4).width = 15;

    // ===== ABA 4: TODAS AS TRANSAÇÕES =====
    if (transacoesFiltradas && transacoesFiltradas.length > 0) {
      const wsTodas = workbook.addWorksheet('Todas Transações', {
        views: [{ showGridLines: false }],
      });

      // Título
      wsTodas.mergeCells('A1:E1');
      const todasTitleCell = wsTodas.getCell('A1');
      todasTitleCell.value = 'TODAS AS TRANSAÇÕES';
      todasTitleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
      todasTitleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' }, // Roxo
      };
      todasTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      wsTodas.getRow(1).height = 30;

      // Cabeçalhos
      const todasHeaders = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'];
      todasHeaders.forEach((header, idx) => {
        const cell = wsTodas.getCell(3, idx + 1);
        cell.value = header;
        cell.font = { bold: true, size: 12 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E7EB' },
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
      wsTodas.getRow(3).height = 25;

      // Dados
      rowIdx = 4;
      transacoesFiltradas.forEach((t) => {
        const row = wsTodas.getRow(rowIdx);
        row.getCell(1).value = new Date(t.data).toLocaleDateString('pt-BR');
        row.getCell(2).value = t.descricao;
        row.getCell(3).value = t.tipo;
        row.getCell(4).value = t.categoria;
        row.getCell(5).value = `R$ ${t.valor.toFixed(2)}`;

        // Cor do tipo
        const tipoCell = row.getCell(3);
        if (t.tipo === 'Receita') {
          tipoCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          tipoCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' },
          };
        } else {
          tipoCell.font = { color: { argb: 'FFEF4444' }, bold: true };
          tipoCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFECACA' },
          };
        }

        // Cor do valor
        row.getCell(5).font = {
          color: { argb: t.tipo === 'Receita' ? 'FF16A34A' : 'FFEF4444' },
          bold: true,
        };

        // Bordas e alinhamento
        for (let col = 1; col <= 5; col++) {
          const cell = row.getCell(col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }

        // Cor de fundo alternada
        if (rowIdx % 2 === 0) {
          for (let col = 1; col <= 5; col++) {
            const cell = row.getCell(col);
            if (col !== 3) {
              // Não sobrescrever a cor do tipo
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF9FAFB' },
              };
            }
          }
        }

        rowIdx++;
      });

      // Larguras das colunas
      wsTodas.getColumn(1).width = 12;
      wsTodas.getColumn(2).width = 35;
      wsTodas.getColumn(3).width = 12;
      wsTodas.getColumn(4).width = 20;
      wsTodas.getColumn(5).width = 15;
    }

    // Gerar arquivo e fazer download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    saveAs(blob, `Relatorio_Financeiro_${hoje}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
    >
      <ArrowUpTrayIcon className="w-5 h-5" />
      Exportar Relatório Excel
    </button>
  );
}
