import copy
from typing import Any

from dados.catalogos_marcha import ACTION_CATALOG, DEFAULT_VISUAL, REAGENT_CATALOG, STAGE_DEFINITIONS
from visual.estado_visual import atualizar_cena


def criar_estado_inicial() -> dict[str, Any]:
    etapas = []
    for definition in STAGE_DEFINITIONS:
        etapa_id = definition["id"]
        etapas.append(
            {
                "id": etapa_id,
                "label": definition["label"],
                "descricao": definition["descricao"],
                "concluida": etapa_id == 0,
                "bloqueada": etapa_id not in (0, 1),
                "observacao": "Aguardando execucao.",
            }
        )

    # este dicionÃ¡rio Ã© o contrato central entre backend, frontend e relatÃ³rio
    estado = {
        "schema_version": 1,
        "simulacao_tipo": "marcha-por-grupos",
        "roteiro": {
            "titulo": "Marcha analitica por grupos conhecidos",
            "descricao": "Cada etapa comeca com uma solucao-mae conhecida para estudar a separacao dos cations.",
        },
        "etapa_corrente": 0,
        "etapas": etapas,
        "historico": [
            "Simulacao iniciada. O roteiro foi reorganizado por grupos conhecidos para facilitar o estudo."
        ],
        "observacao_atual": (
            "Nesta versao, cada grupo comeca com uma solucao-mae conhecida. "
            "Voce observa a separacao por reagentes, agitacao, centrifugacao e aquecimento."
        ),
        "progresso": 0,
        "resumo_final": [],
        "precipitacoes": [],
        "ultima_precipitacao": None,
        "grupo1": {
            "amostra_atual": None,
            "testadas": [],
            "pendencia": None,
        },
        "grupo2": {
            "fase": "pronto_para_mg",
            "pendencia": None,
            "reagente_atual": None,
            "magnesio_separado": False,
            "carbonatos_separados": False,
        },
        "grupo3": {
            "fase": "pronto_para_nh4cl",
            "pendencia": None,
            "nh4cl_adicionado": False,
            "nh4oh_adicionado": False,
            "hidroxidos_separados": False,
            "ni_confirmado": False,
        },
        "visual": copy.deepcopy(DEFAULT_VISUAL),
        "cena": {},
        "teste_chama": {
            "ativa": False,
            "cor": None,
            "mensagem": "Escolha um sal para iniciar o teste de chama.",
        },
    }

    atualizar_cena(estado)
    return estado


def obter_catalogo_reagentes(estado: dict[str, Any]) -> list[dict[str, Any]]:
    etapa = estado["etapa_corrente"]
    reagentes = []

    for item in REAGENT_CATALOG:
        # libera apenas os reagentes compatÃ­veis com a etapa e a fase interna atual
        if etapa not in item["etapas"]:
            continue

        if etapa == 2 and item["nome"] == "Reagente precipitante do Mg2+" and estado["grupo2"]["magnesio_separado"]:
            continue

        if etapa == 2 and item["nome"] == "Carbonato de amonio" and not estado["grupo2"]["magnesio_separado"]:
            continue

        if etapa == 2 and item["nome"] == "Carbonato de amonio" and estado["grupo2"]["carbonatos_separados"]:
            continue

        if etapa == 3 and item["nome"] == "NH4Cl" and estado["grupo3"]["nh4cl_adicionado"]:
            continue

        if etapa == 3 and item["nome"] == "NH4OH" and (
            not estado["grupo3"]["nh4cl_adicionado"] or estado["grupo3"]["nh4oh_adicionado"]
        ):
            continue

        if etapa == 3 and item["nome"] == "Dimetilglioxima" and not estado["grupo3"]["hidroxidos_separados"]:
            continue

        if etapa == 3 and item["nome"] == "Dimetilglioxima" and estado["grupo3"]["ni_confirmado"]:
            continue

        reagentes.append(copy.deepcopy(item))

    return reagentes


def obter_acoes_disponiveis(estado: dict[str, Any]) -> list[dict[str, Any]]:
    etapa = estado["etapa_corrente"]
    acoes = []

    if etapa == 0:
        # a introduÃ§Ã£o sÃ³ permite iniciar o roteiro
        acoes.append(criar_acao("iniciar_roteiro"))

    if etapa == 1 and estado["grupo1"]["pendencia"] == "aquecer":
        acoes.append(criar_acao("aquecer"))
    if etapa == 1 and estado["teste_chama"]["ativa"]:
        acoes.append(criar_acao("desligar_chama"))

    if etapa == 2:
        if estado["grupo2"]["pendencia"] == "agitar":
            acoes.append(criar_acao("agitar"))
        if estado["grupo2"]["pendencia"] == "centrifugar":
            acoes.append(criar_acao("centrifugar"))

    if etapa == 3:
        if estado["grupo3"]["pendencia"] == "agitar":
            acoes.append(criar_acao("agitar"))
        if estado["grupo3"]["pendencia"] == "centrifugar":
            acoes.append(criar_acao("centrifugar"))

    return acoes


def obter_estado_publico(estado: dict[str, Any]) -> dict[str, Any]:
    garantir_campos_atuais(estado)
    publico = copy.deepcopy(estado)
    publico["reagentes_disponiveis"] = obter_catalogo_reagentes(estado)
    publico["acoes_disponiveis"] = obter_acoes_disponiveis(estado)
    return publico


def garantir_campos_atuais(estado: dict[str, Any]) -> None:
    # mantém compatibilidade com simulações antigas salvas no banco local
    estado.setdefault("precipitacoes", [])
    estado.setdefault("ultima_precipitacao", None)


def criar_acao(nome: str) -> dict[str, Any]:
    dados = ACTION_CATALOG[nome]
    return {"nome": nome, "label": dados["label"], "descricao": dados["descricao"]}
