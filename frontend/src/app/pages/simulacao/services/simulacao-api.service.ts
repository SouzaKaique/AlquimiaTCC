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

  obterEstado(): Observable<RespostaEstadoSimulacao> {
    return this.http.get<RespostaEstadoSimulacao>(`${this.api}/estado`);
  }

  iniciar(): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/iniciar`, {});
  }

  aplicarReagente(reagente: string): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/reagente`, { reagente });
  }

  executarAcao(acao: string): Observable<RespostaEstadoSimulacao> {
    return this.http.post<RespostaEstadoSimulacao>(`${this.api}/acao`, { acao });
  }
}
