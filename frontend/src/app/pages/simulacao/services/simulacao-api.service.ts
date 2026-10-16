import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { EstadoSimulacao } from '../models/estado-simulacao.model';

export interface RespostaEstadoSimulacao {
  estado: EstadoSimulacao;
  mensagem?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SimulacaoApiService {
  private readonly api = `${API_BASE_URL}/simulacao`;

  constructor(private readonly http: HttpClient) {}

  // busca a simulação ativa do usuário autenticado
  obterEstado(): Observable<RespostaEstadoSimulacao> {
    return this.http.get<RespostaEstadoSimulacao>(`${this.api}/estado`);
  }

  // inicia uma nova marcha e substitui qualquer simulação ativa anterior
  iniciar(): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/iniciar`, {});
  }

  // envia o reagente escolhido para o backend decidir a reação correta
  aplicarReagente(reagente: string): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/reagente`, { reagente });
  }

  // executa ações de bancada, como aquecer, agitar e centrifugar
  executarAcao(acao: string): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/acao`, { acao });
  }

  // modo apresentação: pula direto para a etapa (backend recusa usuário comum)
  irParaEtapa(etapa: number): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/etapa`, { etapa });
  }
}
