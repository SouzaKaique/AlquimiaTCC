import { Injectable } from '@angular/core';

import { EstadoSimulacao } from '../../pages/simulacao/models/estado-simulacao.model';

type DocumentoPdf = {
  setFont: (fonte: string, estilo?: string) => void;
  setFontSize: (tamanho: number) => void;
  text: (texto: string | string[], x: number, y: number) => void;
  splitTextToSize: (texto: string, largura: number) => string[];
  addPage: () => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
};

// gera o pdf do relatorio com jspdf (carregado sob demanda)
@Injectable({
  providedIn: 'root',
})
export class RelatorioPdfService {
  async exportar(estado: EstadoSimulacao): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const documento = new jsPDF({ unit: 'mm', format: 'a4' });
    const margem = 16;
    const larguraTexto = 178;
    let y = 18;

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(18);
    documento.text('Alquim.IA', margem, y);

    y += 8;
    documento.setFontSize(14);
    documento.text('Relatório da Marcha Analítica', margem, y);

    y += 8;
    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    documento.text(`Data: ${new Date().toLocaleString('pt-BR')}`, margem, y);

    y = this.escreverSecao(documento, 'Nome da marcha', [estado.roteiro.titulo], y + 12, margem, larguraTexto);
    y = this.escreverSecao(
      documento,
      'Grupos',
      estado.etapas.map((etapa) => `${etapa.label}: ${etapa.concluida ? 'concluído' : 'pendente'}`),
      y + 4,
      margem,
      larguraTexto,
    );
    y = this.escreverSecao(documento, 'Observações', estado.resumo_final, y + 4, margem, larguraTexto);

    const reagentesUtilizados = (estado.reagentes_utilizados ?? []).map(
      (reagente) => `${reagente.nome} (${reagente.sigla})`,
    );
    y = this.escreverSecao(documento, 'Reagentes utilizados', reagentesUtilizados, y + 4, margem, larguraTexto);

    const precipitacoes = (estado.precipitacoes ?? []).map((item) => {
      const reagente = item.reagente_precipitante;
      return `${item.grupo}: ${reagente.nome} (${reagente.formula}) formou ${item.precipitado}. Íons: ${item.ions.join(', ')}.`;
    });
    y = this.escreverSecao(documento, 'Reagentes precipitantes', precipitacoes, y + 4, margem, larguraTexto);

    y = this.escreverSecao(documento, 'Histórico', estado.historico, y + 4, margem, larguraTexto);
    y = this.escreverSecao(
      documento,
      'Resultado',
      [estado.observacao_atual || 'Marcha finalizada sem observação adicional.', `Progresso: ${estado.progresso}%`],
      y + 4,
      margem,
      larguraTexto,
    );

    documento.save('relatorio-marcha-analitica.pdf');
  }

  private escreverSecao(
    documento: DocumentoPdf,
    titulo: string,
    linhas: string[],
    yInicial: number,
    margem: number,
    larguraTexto: number,
  ): number {
    let y = this.garantirEspaco(documento, yInicial, 22, margem);

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(12);
    documento.text(titulo, margem, y);
    y += 6;

    documento.setFont('helvetica', 'normal');
    documento.setFontSize(9);

    const conteudo = linhas.length ? linhas : ['Sem registros disponíveis.'];
    for (const linha of conteudo) {
      const textoQuebrado = documento.splitTextToSize(`- ${linha}`, larguraTexto);
      y = this.garantirEspaco(documento, y, textoQuebrado.length * 5 + 3, margem);
      documento.text(textoQuebrado, margem, y);
      y += textoQuebrado.length * 5 + 2;
    }

    return y;
  }

  private garantirEspaco(documento: DocumentoPdf, y: number, altura: number, margem: number): number {
    if (y + altura <= 286) {
      return y;
    }

    documento.addPage();
    documento.setDrawColor(35, 54, 66);
    documento.line(margem, 12, 194, 12);
    return 20;
  }
}
