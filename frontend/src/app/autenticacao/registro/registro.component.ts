import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import 'notyf/notyf.min.css';

import gsap from 'gsap';
import { Notyf } from 'notyf';

import { LayoutAutenticacaoComponent } from '../layout-autenticacao/layout-autenticacao.component';
import { AutenticacaoService } from '../../core/services/autenticacao';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LayoutAutenticacaoComponent],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit {
  private notyf!: Notyf;
  usuario = '';
  senha = '';
  confirmarSenha = '';

  mostrarSenha = false;
  mostrarConfirmar = false;
  mensagemErro = '';
  carregando = false;

  @ViewChild('formEl', { read: ElementRef }) formulario?: ElementRef;

  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  ngOnInit(): void {
    this.notyf = new Notyf({
      duration: 2600,
      ripple: true,
      position: { x: 'right', y: 'top' },
      types: [
        { type: 'sucesso', background: '#5d8f5f', icon: false },
        { type: 'erro', background: '#b76557', icon: false },
      ],
    });
  }

  alternarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  alternarConfirmarSenha(): void {
    this.mostrarConfirmar = !this.mostrarConfirmar;
  }

  registrar(): void {
    if (this.carregando) {
      return;
    }

    this.mensagemErro = '';

    if (this.senha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem.';
      this.notyf.open({ type: 'erro', message: this.mensagemErro });
      this.animarErro();
      return;
    }

    this.carregando = true;
    this.autenticacaoService.registrar(this.usuario, this.senha).subscribe({
        next: () => {
          this.notyf.open({ type: 'sucesso', message: 'Conta criada com sucesso. Você já pode entrar.' });
          this.animarSucesso();
          window.setTimeout(() => {
            window.location.assign('/');
          }, 900);
        },
        error: (erro: HttpErrorResponse) => {
          this.carregando = false;
          this.mensagemErro = erro?.error?.error || 'Não foi possível criar a conta.';
          this.notyf.open({ type: 'erro', message: this.mensagemErro });
          this.animarErro();
        },
      });
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
