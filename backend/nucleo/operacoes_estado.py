import copy

from dados.catalogos_marcha import REAGENT_CATALOG


def registrar_evento(estado: dict, mensagem: str) -> None:
    estado["historico"].insert(0, mensagem)


def registrar_reagente_utilizado(estado: dict, nome: str) -> None:
    # mantém a lista de reagentes realmente usados na marcha, para o relatorio final
    usados = estado.setdefault("reagentes_utilizados", [])
    if any(item["nome"] == nome for item in usados):
        return

    catalogo = next((item for item in REAGENT_CATALOG if item["nome"] == nome), None)
    if not catalogo:
        return

    usados.append(copy.deepcopy(catalogo))


def registrar_precipitacao(
    estado: dict,
    *,
    nome_reagente: str,
    formula_reagente: str,
    etapa: int,
    grupo: str,
    precipitado: str,
    ions: list[str],
    observacao: str,
) -> None:
    # guarda os dados principais da precipitação para observação, histórico e relatório
    registro = {
        "reagente_precipitante": {
            "nome": nome_reagente,
            "formula": formula_reagente,
        },
        "etapa": etapa,
        "grupo": grupo,
        "precipitado": precipitado,
        "ions": ions,
        "observacao": observacao,
    }

    estado["ultima_precipitacao"] = registro
    estado.setdefault("precipitacoes", []).insert(0, registro)
    registrar_evento(
        estado,
        f"Reagente precipitante: {nome_reagente} ({formula_reagente}) formou {precipitado}.",
    )


def desbloquear_etapa(estado: dict, etapa_id: int) -> None:
    for etapa in estado["etapas"]:
        if etapa["id"] == etapa_id:
            etapa["bloqueada"] = False
            break


def concluir_etapa(estado: dict, etapa_id: int) -> None:
    for etapa in estado["etapas"]:
        if etapa["id"] == etapa_id:
            etapa["concluida"] = True
            etapa["bloqueada"] = False
            etapa["observacao"] = estado["observacao_atual"]
            break

    atualizar_progresso(estado)


def atualizar_progresso(estado: dict) -> None:
    concluidas = [
        etapa
        for etapa in estado["etapas"]
        if etapa["id"] in (1, 2, 3) and etapa["concluida"]
    ]
    estado["progresso"] = round((len(concluidas) / 3) * 100)

    if len(concluidas) == 3:
        desbloquear_etapa(estado, 4)
