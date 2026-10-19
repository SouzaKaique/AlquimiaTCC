# Arquitetura do Alquim.IA

## Fluxo principal

```text
Angular
  -> AutenticacaoService / SimulacaoApiService
  -> autenticacaoInterceptor
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
- `models.py`: persistencia SQLAlchemy.

### Modo apresentacao

- Usuarios listados em `USUARIOS_APRESENTACAO` (padrao: `apresentacao`) podem clicar nas etapas da barra superior.
- `POST /simulacao/etapa` monta a marcha ja posicionada na etapa escolhida, executando os grupos anteriores com `ROTEIRO_COMPLETO` (em `simulacoes/marcha_analitica.py`).
- Usuario comum recebe `403` nessa rota.

## Contratos principais

- `POST /auth/register`
- `POST /auth/login`
- `GET /simulacao/estado`
- `POST /simulacao/iniciar`
- `POST /simulacao/reagente`
- `POST /simulacao/acao`
- `POST /simulacao/etapa` (modo apresentacao)
- `POST /simulacao/finalizar`
- `GET /saude`

## Persistencia

O banco local fica em `backend/instance/database.db` e nao deve ser versionado em novos ambientes.
As tabelas `reagentes` e `reacoes` continuam no esquema, mas a marcha usa o catalogo fixo de `dados/catalogos_marcha.py`.

## Validacao

- Frontend: Vitest e build Angular.
- Backend: `unittest`, testes de contrato HTTP e `compileall`.
- O teste backend usa SQLite em memoria por meio da fabrica `create_app`, sem tocar no banco local.
