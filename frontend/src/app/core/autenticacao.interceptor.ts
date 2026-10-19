import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from './config/api.config';
import { AutenticacaoService } from './services/autenticacao';

// bloco do token nas requisicoes
export const autenticacaoInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AutenticacaoService).obterToken();

  if (!token || !req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
