$ErrorActionPreference = "Stop"

$raiz = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $raiz "frontend"
$backend = Join-Path $raiz "backend"
$python = Join-Path $backend "venv\Scripts\python.exe"

Push-Location $backend
try {
    & $python -m compileall -q . -x "venv|__pycache__"
    & $python -m unittest discover -s tests -v
}
finally {
    Pop-Location
}

Push-Location $frontend
try {
    npm run build
    npx ng test --watch=false
}
finally {
    Pop-Location
}

Write-Host "Verificacao concluida com sucesso."
