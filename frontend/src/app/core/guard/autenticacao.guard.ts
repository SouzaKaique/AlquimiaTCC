import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AutenticacaoService } from '../services/autenticacao';

// bloco de protecao das rotas
export const autenticacaoGuard: CanActivateFn = () => {
  const autenticacaoService = inject(AutenticacaoService);
  const router = inject(Router);

  return autenticacaoService.estaAutenticado() ? true : router.createUrlTree(['/']);
};
