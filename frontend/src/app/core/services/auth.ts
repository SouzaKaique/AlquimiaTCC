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
  };
}

export interface RespostaRegistro {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = `${API_BASE_URL}/auth`;

  constructor(private readonly http: HttpClient) {}

  login(nome: string, senha: string): Observable<RespostaLogin> {
    return this.http.post<RespostaLogin>(`${this.api}/login`, { nome, senha });
  }

  registrar(nome: string, senha: string): Observable<RespostaRegistro> {
    return this.http.post<RespostaRegistro>(`${this.api}/register`, { nome, senha });
  }

  salvarSessao(token: string, nome: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario_nome', nome);
  }

  obterToken(): string | null {
    return localStorage.getItem('token');
  }

  estaAutenticado(): boolean {
    return !!this.obterToken();
  }

  encerrarSessao(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nome');
    sessionStorage.clear();
  }
}
