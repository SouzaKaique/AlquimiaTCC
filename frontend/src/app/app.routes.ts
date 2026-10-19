import { Routes } from '@angular/router';

import { LoginComponent } from './autenticacao/login/login.component';
import { RegistroComponent } from './autenticacao/registro/registro.component';
import { autenticacaoGuard } from './core/guard/autenticacao.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'simulacao',
    canActivate: [autenticacaoGuard],
    loadComponent: () =>
      import('./pages/simulacao/simulacao').then((modulo) => modulo.SimulacaoComponent),
  },
  {
    path: 'quiz',
    canActivate: [autenticacaoGuard],
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then((modulo) => modulo.QuizComponent),
  },
  {
    path: 'relatorio',
    canActivate: [autenticacaoGuard],
    loadComponent: () =>
      import('./pages/relatorio/relatorio.component').then((modulo) => modulo.RelatorioComponent),
  },
  { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: '' },
];
