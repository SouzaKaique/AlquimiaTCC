# Alquim.IA

Simulador educacional de marcha analitica com frontend Angular e backend Flask.

## Executar

Requisitos:

- Node.js com npm
- Python 3.13
- Dependencias instaladas em `frontend/node_modules` e `backend/venv`

Na raiz do projeto:

```powershell
.\scripts\iniciar.ps1
```

O script valida o backend, escolhe automaticamente uma porta livre entre
`4200` e `4299` para o Angular e confirma a conexao pelo proxy `/api`.

Aplicacao:

- Frontend: URL exibida pelo script, normalmente `http://127.0.0.1:4200`
- Backend: http://127.0.0.1:5000
- Saude direta: http://127.0.0.1:5000/saude
- Saude via frontend: `<URL_DO_FRONTEND>/api/saude`

Para solicitar uma porta especifica:

```powershell
$env:FRONTEND_PORT = 4205
.\scripts\iniciar.ps1
```

## Verificar

```powershell
.\scripts\verificar.ps1
```

O script executa testes backend, compilacao Python, testes Angular e build de producao.

## Modo apresentacao

Crie (pela tela de cadastro) um usuario chamado `apresentacao`. Ao entrar com ele,
os botoes da barra superior (Teste de chama, Grupo 2, Grupo 3, Relatorio) ficam
clicaveis e levam direto para a etapa, com os grupos anteriores ja concluidos.

Para usar outro nome de usuario:

```powershell
$env:USUARIOS_APRESENTACAO = "kaique"
.\scripts\iniciar.ps1
```

## Documentacao

- [Arquitetura](ARQUITETURA.md)
