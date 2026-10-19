import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';

export interface RespostaLogin {
  access_token: string;
  message: string;
  usuario: {
    id: number;
    nome: string;
    apresentador: boolean;
  };
}

export interface RespostaRegistro {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService {
  private readonly api = `${API_BASE_URL}/auth`;

  constructor(private readonly http: HttpClient) {}

  // bloco da api de login
  login(nome: string, senha: string): Observable<RespostaLogin> {
    return this.http.post<RespostaLogin>(`${this.api}/login`, { nome, senha });
  }

  registrar(nome: string, senha: string): Observable<RespostaRegistro> {
    return this.http.post<RespostaRegistro>(`${this.api}/register`, { nome, senha });
  }

  // bloco da sessao
  salvarSessao(token: string, nome: string, apresentador = false): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario_nome', nome);
    localStorage.setItem('usuario_apresentador', apresentador ? '1' : '0');
  }

  obterToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obterToken();
  }

  // bloco do modo apresentacao
  ehApresentador(): boolean {
    return localStorage.getItem('usuario_apresentador') === '1';
  }

  encerrarSessao(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nome');
    localStorage.removeItem('usuario_apresentador');
    sessionStorage.clear();
  }
}
