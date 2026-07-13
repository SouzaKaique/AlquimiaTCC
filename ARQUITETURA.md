# Arquitetura do Alquim.IA

## Fluxo principal

```text
Angular
  -> AuthService / SimulacaoApiService
  -> authInterceptor
  -> Flask routes
  -> ServicoSimulacao
  -> MotorSimulacao
  -> MarchaAnalitica
  -> regras/grupo1, grupo2 e grupo3
  -> gerenciador de estado e estado visual
  -> SQLite
```

## Frontend

### Estrutura ativa

- `src/app/core`: configuracao da API, autenticacao, interceptor e guard.
- `src/app/autenticacao`: telas de login e registro.
- `src/app/pages/simulacao`: orquestrador, tipos, servico HTTP e componentes da marcha.
- `src/app/shared/styles`: design system e estilos modulares do laboratorio.

### Regras de organizacao

- URLs do backend pertencem somente a `core/config/api.config.ts`.
- Componentes nao acessam `HttpClient` diretamente; usam servicos.
- A simulacao e lazy loaded e protegida por `authGuard`.
- Tipos da marcha ficam proximos da feature em `pages/simulacao/interfaces`, `models` e `enums`.
- Estilos visuais da marcha ficam em `shared/styles` e sao carregados apenas pela pagina de simulacao.

## Backend

### Estrutura ativa

- `app.py`: fabrica da aplicacao, blueprints, callbacks e inicializacao.
- `routes`: validacao HTTP e serializacao de respostas.
- `servicos`: casos de uso e transacoes da aplicacao.
- `simulacao/motor.py`: adaptador entre servico e marcha analitica.
- `simulacoes/marcha_analitica.py`: coordenacao da marcha.
- `regras/grupo*`: regras quimicas por grupo analitico.
- `nucleo`: estado, operacoes compartilhadas, tempo e infraestrutura do motor.
- `dados`: catalogos declarativos.
- `visual`: transformacao do estado quimico em estado visual.
- `dominio`: modelos de dominio reutilizaveis.
- `models.py`: persistencia SQLAlchemy.

### Compatibilidade

- `routes/reacoes.py` preserva o endpoint legado, mas delega ao `ServicoSimulacao`.
- `simulacao/base_quimica.py` preserva imports antigos e delega aos modulos novos.
- `simulacao/engine.py`, `simulacao/estado.py` e `simulacao/regras.py` permanecem como modulos experimentais/legados e nao participam do fluxo principal.
- `nucleo/pipeline_quimico.py`, `nucleo/eventos.py` e parte de `dominio` sao bases para evolucao futura.

## Contratos principais

- `POST /auth/register`
- `POST /auth/login`
- `GET /simulacao/estado`
- `POST /simulacao/iniciar`
- `POST /simulacao/reagente`
- `POST /simulacao/acao`
- `POST /simulacao/finalizar`
- `GET /saude`

## Persistencia

O banco local fica em `backend/instance/database.db` e nao deve ser versionado em novos ambientes.
O esquema ainda preserva compatibilidade com colunas historicas obrigatorias de reagentes no historico.

## Validacao

- Frontend: Vitest e build Angular.
- Backend: `unittest`, testes de contrato HTTP e `compileall`.
- O teste backend usa SQLite em memoria por meio da fabrica `create_app`, sem tocar no banco local.
