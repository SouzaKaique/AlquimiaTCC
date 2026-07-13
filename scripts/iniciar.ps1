$ErrorActionPreference = "Stop"

$raiz = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $raiz "frontend"
$backend = Join-Path $raiz "backend"
$python = Join-Path $backend "venv\Scripts\python.exe"
$backendUrl = "http://127.0.0.1:5000"
$hostFrontend = "127.0.0.1"

if (-not (Test-Path $python)) {
    throw "Ambiente Python nao encontrado em backend\venv."
}

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    throw "Dependencias do frontend nao encontradas. Execute npm install em frontend."
}

function Testar-SaudeBackend {
    try {
        $resposta = Invoke-RestMethod -Uri "$backendUrl/saude" -TimeoutSec 2
        return $resposta.status -eq "ok"
    }
    catch {
        return $false
    }
}

function Testar-FrontendConectado {
    param([int]$Porta)

    try {
        $resposta = Invoke-RestMethod -Uri "http://${hostFrontend}:$Porta/api/saude" -TimeoutSec 2
        return $resposta.status -eq "ok"
    }
    catch {
        return $false
    }
}

function Aguardar-Condicao {
    param(
        [scriptblock]$Condicao,
        [string]$Descricao,
        [int]$TimeoutSegundos = 35
    )

    $limite = (Get-Date).AddSeconds($TimeoutSegundos)
    do {
        if (& $Condicao) {
            return
        }
        Start-Sleep -Milliseconds 500
    } while ((Get-Date) -lt $limite)

    throw "Tempo esgotado aguardando $Descricao."
}

$backendOcupado = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($backendOcupado) {
    if (-not (Testar-SaudeBackend)) {
        $pids = ($backendOcupado | Select-Object -ExpandProperty OwningProcess -Unique) -join ", "
        throw "A porta 5000 esta ocupada por outro processo (PID: $pids), mas o backend Alquim.IA nao respondeu."
    }
}
else {
    $logBackend = Join-Path $env:TEMP "alquimia-backend.log"
    $erroBackend = Join-Path $env:TEMP "alquimia-backend-error.log"
    Remove-Item $logBackend, $erroBackend -ErrorAction SilentlyContinue

    Start-Process `
        -FilePath $python `
        -ArgumentList "app.py" `
        -WorkingDirectory $backend `
        -WindowStyle Hidden `
        -RedirectStandardOutput $logBackend `
        -RedirectStandardError $erroBackend

    Aguardar-Condicao -Condicao { Testar-SaudeBackend } -Descricao "o backend em $backendUrl"
}

$portaFrontend = $null

if ($env:FRONTEND_PORT) {
    $portaSolicitada = [int]$env:FRONTEND_PORT
    $portaOcupada = Get-NetTCPConnection -LocalPort $portaSolicitada -State Listen -ErrorAction SilentlyContinue

    if ($portaOcupada -and -not (Testar-FrontendConectado -Porta $portaSolicitada)) {
        throw "A porta FRONTEND_PORT=$portaSolicitada esta ocupada e nao pertence a um frontend conectado."
    }

    $portaFrontend = $portaSolicitada
}
else {
    foreach ($porta in 4200..4299) {
        $ocupada = Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue
        if ($ocupada -and (Testar-FrontendConectado -Porta $porta)) {
            $portaFrontend = $porta
            break
        }
    }

    if ($null -eq $portaFrontend) {
        foreach ($porta in 4200..4299) {
            $ocupada = Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue
            if (-not $ocupada) {
                $portaFrontend = $porta
                break
            }
        }
    }
}

if ($null -eq $portaFrontend) {
    throw "Nenhuma porta livre encontrada entre 4200 e 4299."
}

$frontendJaAtivo = Testar-FrontendConectado -Porta $portaFrontend
if (-not $frontendJaAtivo) {
    $logFrontend = Join-Path $env:TEMP "alquimia-frontend-$portaFrontend.log"
    $erroFrontend = Join-Path $env:TEMP "alquimia-frontend-$portaFrontend-error.log"
    Remove-Item $logFrontend, $erroFrontend -ErrorAction SilentlyContinue

    Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList @("start", "--", "--host", $hostFrontend, "--port", "$portaFrontend") `
        -WorkingDirectory $frontend `
        -WindowStyle Hidden `
        -RedirectStandardOutput $logFrontend `
        -RedirectStandardError $erroFrontend

    try {
        Aguardar-Condicao `
            -Condicao { Testar-FrontendConectado -Porta $portaFrontend } `
            -Descricao "o frontend conectado na porta $portaFrontend" `
            -TimeoutSegundos 60
    }
    catch {
        $detalhes = Get-Content $erroFrontend -Raw -ErrorAction SilentlyContinue
        if (-not $detalhes) {
            $detalhes = Get-Content $logFrontend -Raw -ErrorAction SilentlyContinue
        }
        throw "$($_.Exception.Message)`n$detalhes"
    }
}

$frontendUrl = "http://${hostFrontend}:$portaFrontend"

Write-Output "Alquim.IA iniciado e conectado."
Write-Output "Frontend: $frontendUrl"
Write-Output "Backend:  $backendUrl"
Write-Output "Saude via frontend: $frontendUrl/api/saude"
