import { Pipe, PipeTransform } from '@angular/core';

const SUBSTITUICOES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bsolucoes-mae\b/gi, 'soluções-mãe'],
  [/\bsolucao-mae\b/gi, 'solução-mãe'],
  [/\bintroducao\b/gi, 'introdução'],
  [/\brelatorio\b/gi, 'relatório'],
  [/\bobservacao\b/gi, 'observação'],
  [/\breacao\b/gi, 'reação'],
  [/\bcentrifuga\b/gi, 'centrífuga'],
  [/\bcentrifugacao\b/gi, 'centrifugação'],
  [/\banalitica\b/gi, 'analítica'],
  [/\banalise\b/gi, 'análise'],
  [/\bdescricao\b/gi, 'descrição'],
  [/\bversao\b/gi, 'versão'],
  [/\bsequencia\b/gi, 'sequência'],
  [/\bhistorico\b/gi, 'histórico'],
  [/\bpraticas\b/gi, 'práticas'],
  [/\bpratica\b/gi, 'prática'],
  [/\busuarios\b/gi, 'usuários'],
  [/\busuario\b/gi, 'usuário'],
  [/\bestatisticas\b/gi, 'estatísticas'],
  [/\bsimulacao\b/gi, 'simulação'],
  [/\blaboratorio\b/gi, 'laboratório'],
  [/\bagitacao\b/gi, 'agitação'],
  [/\brotacao\b/gi, 'rotação'],
  [/\bseparacao\b/gi, 'separação'],
  [/\bseparacoes\b/gi, 'separações'],
  [/\bhomogeneizacao\b/gi, 'homogeneização'],
  [/\bconfirmacao\b/gi, 'confirmação'],
  [/\bprecipitacao\b/gi, 'precipitação'],
  [/\bvisualizacao\b/gi, 'visualização'],
  [/\bidentificacao\b/gi, 'identificação'],
  [/\bcoloracao\b/gi, 'coloração'],
  [/\bfracao\b/gi, 'fração'],
  [/\bfracoes\b/gi, 'frações'],
  [/\bhidroxidos\b/gi, 'hidróxidos'],
  [/\bmagnesio\b/gi, 'magnésio'],
  [/\bpotassio\b/gi, 'potássio'],
  [/\bsodio\b/gi, 'sódio'],
  [/\bestroncio\b/gi, 'estrôncio'],
  [/\bcations\b/gi, 'cátions'],
  [/\bliquida\b/gi, 'líquida'],
  [/\binsoluveis\b/gi, 'insolúveis'],
  [/\batribuido\b/gi, 'atribuído'],
  [/\bconcluido\b/gi, 'concluído'],
  [/\bcomeca\b/gi, 'começa'],
  [/\baqueca\b/gi, 'aqueça'],
  [/\bvoce\b/gi, 'você'],
  [/\bnao\b/gi, 'não'],
  [/\bapos\b/gi, 'após'],
  [/\bate\b/gi, 'até'],
  [/\besta\b/gi, 'está'],
  [/\bha\b/gi, 'há'],
  [/\bsera\b/gi, 'será'],
  [/\bpossivel\b/gi, 'possível'],
  [/\bja\b/gi, 'já'],
  [/\bexecucao\b/gi, 'execução'],
  [/\bproxima\b/gi, 'próxima'],
  [/\btipico\b/gi, 'típico'],
  [/\btipica\b/gi, 'típica'],
  [/\bcaracteristica\b/gi, 'característica'],
  [/\bconclusao\b/gi, 'conclusão'],
];

// o backend manda textos sem acento; este pipe troca as palavras para a forma acentuada na tela
@Pipe({
  name: 'textoVisivel',
  standalone: true,
  pure: true,
})
export class TextoVisivelPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    if (!valor) {
      return '';
    }

    return SUBSTITUICOES.reduce((texto, [padrao, substituicao]) => {
      return texto.replace(padrao, (encontrado) => this.preservarCaixa(encontrado, substituicao));
    }, valor);
  }

  private preservarCaixa(original: string, substituicao: string): string {
    if (original === original.toUpperCase()) {
      return substituicao.toUpperCase();
    }

    if (original[0] === original[0]?.toUpperCase()) {
      return `${substituicao[0].toUpperCase()}${substituicao.slice(1)}`;
    }

    return substituicao;
  }
}
