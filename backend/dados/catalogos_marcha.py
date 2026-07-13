STAGE_DEFINITIONS = [
    {
        "id": 0,
        "label": "Introducao",
        "descricao": "Apresentacao do roteiro com solucoes-mae conhecidas por grupo.",
    },
    {
        "id": 1,
        "label": "Grupo 1",
        "descricao": "Teste de chama com sais conhecidos do grupo dos alcalinos e alcalino-terrosos.",
    },
    {
        "id": 2,
        "label": "Grupo 2",
        "descricao": "Separacao de Mg2+, Ca2+ e Ba2+ por precipitacao e centrifugacao.",
    },
    {
        "id": 3,
        "label": "Grupo 3",
        "descricao": "Separacao de Fe3+, Al3+ e confirmacao de Ni2+ com reagentes seletivos.",
    },
    {
        "id": 4,
        "label": "Relatorio",
        "descricao": "Resumo final das observacoes da marcha por grupos.",
    },
]

FLAME_SAMPLES = {
    "Sal de potassio": {
        "sigla": "K",
        "descricao": "Use no teste de chama para observar a coloracao violeta.",
        "corCard": "#8f79d6",
        "flame_color": "#b896ff",
        "resultado": "A chama ficou violeta, caracteristica de sais de potassio.",
    },
    "Sal de sodio": {
        "sigla": "Na",
        "descricao": "Use no teste de chama para observar a coloracao amarela intensa.",
        "corCard": "#d2b04d",
        "flame_color": "#ffd24f",
        "resultado": "A chama ficou amarela intensa, comportamento tipico de sais de sodio.",
    },
    "Sal de estroncio": {
        "sigla": "Sr",
        "descricao": "Use no teste de chama para observar a coloracao vermelha.",
        "corCard": "#d66563",
        "flame_color": "#ff6b5d",
        "resultado": "A chama ficou vermelha carmim, tipica de sais de estroncio.",
    },
}

REAGENT_CATALOG = [
    {
        "nome": "Sal de potassio",
        "sigla": "K",
        "descricao": FLAME_SAMPLES["Sal de potassio"]["descricao"],
        "corCard": FLAME_SAMPLES["Sal de potassio"]["corCard"],
        "tipo": "sal",
        "etapas": [1],
    },
    {
        "nome": "Sal de sodio",
        "sigla": "Na",
        "descricao": FLAME_SAMPLES["Sal de sodio"]["descricao"],
        "corCard": FLAME_SAMPLES["Sal de sodio"]["corCard"],
        "tipo": "sal",
        "etapas": [1],
    },
    {
        "nome": "Sal de estroncio",
        "sigla": "Sr",
        "descricao": FLAME_SAMPLES["Sal de estroncio"]["descricao"],
        "corCard": FLAME_SAMPLES["Sal de estroncio"]["corCard"],
        "tipo": "sal",
        "etapas": [1],
    },
    {
        "nome": "Reagente precipitante do Mg2+",
        "sigla": "R-Mg",
        "descricao": "Adicione para iniciar a precipitacao seletiva do magnesio.",
        "corCard": "#6d98a6",
        "tipo": "reagente",
        "etapas": [2],
    },
    {
        "nome": "Carbonato de amonio",
        "sigla": "(NH4)2CO3",
        "descricao": "Precipita Ca2+ e Ba2+ no sobrenadante do grupo 2.",
        "corCard": "#9e8ac7",
        "tipo": "reagente",
        "etapas": [2],
    },
    {
        "nome": "NH4Cl",
        "sigla": "NH4Cl",
        "descricao": "Condiciona o meio antes da precipitacao dos hidroxidos do grupo 3.",
        "corCard": "#7f9ac1",
        "tipo": "reagente",
        "etapas": [3],
    },
    {
        "nome": "NH4OH",
        "sigla": "NH4OH",
        "descricao": "Promove a precipitacao dos hidroxidos do grupo 3.",
        "corCard": "#6aa0b6",
        "tipo": "reagente",
        "etapas": [3],
    },
    {
        "nome": "Dimetilglioxima",
        "sigla": "DMG",
        "descricao": "Confirma Ni2+ no sobrenadante por precipitado vermelho.",
        "corCard": "#cc6c78",
        "tipo": "reagente",
        "etapas": [3],
    },
]

ACTION_CATALOG = {
    "iniciar_roteiro": {
        "label": "Iniciar marcha",
        "descricao": "Abre a primeira pratica com a solucao-mae do grupo 1.",
    },
    "aquecer": {
        "label": "Aquecer",
        "descricao": "Aproxime a amostra da chama para observar a coloracao.",
    },
    "desligar_chama": {
        "label": "Desligar chama",
        "descricao": "Apaga a chama e limpa a visualizacao do teste atual.",
    },
    "agitar": {
        "label": "Agitar",
        "descricao": "Homogeneiza a solucao e revela a reacao esperada.",
    },
    "centrifugar": {
        "label": "Centrifugar",
        "descricao": "Separa precipitado e sobrenadante para continuar a marcha.",
    },
}

DEFAULT_VISUAL = {
    "nivel": 48,
    "cor_solucao": "#7a8e9b",
    "gradiente": "linear-gradient(180deg, #90a4b2 0%, #7a8e9b 55%, #5e6c78 100%)",
    "turva": False,
    "precipitado_ativo": False,
    "precipitado_cor": "#d7d3c8",
}
