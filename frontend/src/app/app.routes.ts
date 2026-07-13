import { Routes } from '@angular/router';

import { LoginComponent } from './autenticacao/login/login.component';
import { RegistroComponent } from './autenticacao/registro/registro.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'simulacao',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/simulacao/simulacao').then((modulo) => modulo.SimulacaoComponent),
  },
  {
    path: 'quiz',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/quiz/quiz.component').then((modulo) => modulo.QuizComponent),
  },
  {
    path: 'relatorio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/relatorio/relatorio.component').then((modulo) => modulo.RelatorioComponent),
  },
  { path: 'registro', component: RegistroComponent },
  { path: '**', redirectTo: '' },
];
