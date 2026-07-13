import { TextoVisivelPipe } from './texto-visivel.pipe';

describe('TextoVisivelPipe', () => {
  const pipe = new TextoVisivelPipe();

  it('acentua textos de apresentação sem alterar símbolos químicos', () => {
    expect(pipe.transform('Introducao da solucao-mae com Mg2+ e centrifugacao.')).toBe(
      'Introdução da solução-mãe com Mg2+ e centrifugação.',
    );
  });

  it('preserva a caixa inicial do texto', () => {
    expect(pipe.transform('Relatorio e observacao atual.')).toBe('Relatório e observação atual.');
  });
});
