import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import 'notyf/notyf.min.css';

import gsap from 'gsap';
import { Notyf } from 'notyf';

import { AuthLayoutComponent } from '../../auth/auth-layout.component/auth-layout.component';
import { AuthService, RespostaLogin } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AuthLayoutComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private notyf!: Notyf;

  usuario = '';
  senha = '';
  mostrarSenha = false;
  carregando = false;
  mensagemErro = '';

  @ViewChild('formEl', { read: ElementRef }) formulario?: ElementRef;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.mensagemErro = '';
    this.notyf = new Notyf({
      duration: 2600,
      ripple: true,
      position: { x: 'right', y: 'top' },
      types: [
        {
          type: 'sucesso',
          background: '#5d8f5f',
          icon: false,
        },
        {
          type: 'erro',
          background: '#b76557',
          icon: false,
        },
      ],
    });
  }

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  login(): void {
    this.mensagemErro = '';

    if (!this.usuario || !this.senha || this.carregando) {
      if (!this.carregando) {
        this.mensagemErro = 'Preencha usuário e senha para continuar.';
        this.notyf.open({ type: 'erro', message: this.mensagemErro });
        this.animarErro();
      }
      return;
    }

    this.carregando = true;

    this.authService.login(this.usuario, this.senha).subscribe({
        next: (resposta) => this.loginSucesso(resposta),
        error: (erro) => this.loginErro(erro),
      });
  }

  private loginSucesso(resposta: RespostaLogin): void {
    this.carregando = false;
    this.authService.salvarSessao(resposta.access_token, resposta.usuario.nome || this.usuario);
    this.animarSucesso();
    this.notyf.open({
      type: 'sucesso',
      message: 'Login realizado com sucesso. Abrindo a simulação...',
    });
    window.setTimeout(() => {
      window.location.assign('/simulacao');
    }, 900);
  }

  private loginErro(erro: HttpErrorResponse): void {
    this.carregando = false;
    this.mensagemErro =
      erro?.error?.error ||
      (erro?.status === 0
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
        : 'Usuário ou senha inválidos.');
    this.notyf.open({ type: 'erro', message: this.mensagemErro });
    this.animarErro();
  }

  private animarErro(): void {
    if (!this.formulario) {
      return;
    }

    gsap.fromTo(
      this.formulario.nativeElement,
      { x: -8 },
      { x: 8, duration: 0.06, repeat: 5, yoyo: true },
    );
  }

  private animarSucesso(): void {
    if (!this.formulario) {
      return;
    }

    gsap.fromTo(
      this.formulario.nativeElement,
      { scale: 1 },
      { scale: 1.03, duration: 0.12, repeat: 1, yoyo: true },
    );
  }
}
