import { Acao } from '../interfaces/acao.interface';
import { Cena } from '../interfaces/cena.interface';
import { Etapa } from '../interfaces/etapa.interface';
import { Reagente } from '../interfaces/reagente.interface';
import { TesteChama } from '../interfaces/teste-chama.interface';
import { VisualEstado } from '../interfaces/visual-estado.interface';

export interface EstadoSimulacao {
  roteiro: {
    titulo: string;
    descricao: string;
  };
  etapa_corrente: number;
  etapas: Etapa[];
  historico: string[];
  observacao_atual: string;
  progresso: number;
  resumo_final: string[];
  precipitacoes: RegistroPrecipitacao[];
  ultima_precipitacao: RegistroPrecipitacao | null;
  reagentes_disponiveis: Reagente[];
  reagentes_utilizados: Reagente[];
  acoes_disponiveis: Acao[];
  visual: VisualEstado;
  cena: Cena;
  teste_chama: TesteChama;
}

export interface RegistroPrecipitacao {
  reagente_precipitante: {
    nome: string;
    formula: string;
  };
  precipitado: string;
  ions: string[];
  etapa: number;
  grupo: string;
  observacao: string;
}
