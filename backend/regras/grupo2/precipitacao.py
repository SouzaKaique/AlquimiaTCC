from nucleo.operacoes_estado import (
    concluir_etapa,
    desbloquear_etapa,
    registrar_evento,
    registrar_precipitacao,
    registrar_reagente_utilizado,
)
from visual.estado_visual import aplicar_visual


# grupo 2 - Mg2+, Ca2+ e Ba2+
# fases: pronto_para_mg -> precipitado_mg_formado -> sobrenadante_mg -> carbonatos_formados -> concluido
# cada reagente pede agitar e depois centrifugar


# aceita so o reagente esperado na fase atual
def aplicar_reagente(estado: dict, reagente: str) -> None:
    grupo2 = estado["grupo2"]

    if grupo2["fase"] == "pronto_para_mg" and reagente == "Reagente precipitante do Mg2+":
        registrar_reagente_utilizado(estado, reagente)
        grupo2["reagente_atual"] = reagente
        grupo2["pendencia"] = "agitar"
        estado["observacao_atual"] = "Reagente adicionado. Agite para revelar o precipitado branco de Mg2+."
        registrar_evento(estado, "Reagente seletivo do Mg2+ adicionado ao grupo 2.")
        return

    if grupo2["fase"] == "sobrenadante_mg" and reagente == "Carbonato de amonio":
        registrar_reagente_utilizado(estado, reagente)
        grupo2["reagente_atual"] = reagente
        grupo2["pendencia"] = "agitar"
        estado["observacao_atual"] = (
            "Carbonato de amonio adicionado. Agite para precipitar Ca2+ e Ba2+ no sobrenadante."
        )
        registrar_evento(estado, "Carbonato de amonio adicionado ao sobrenadante do grupo 2.")
        return

    estado["observacao_atual"] = "Esse reagente nao corresponde ao passo atual do grupo 2."


# agitacao forma o precipitado (Mg2+ primeiro, depois carbonatos de Ca2+ e Ba2+)
def agitar(estado: dict) -> None:
    grupo2 = estado["grupo2"]

    if grupo2["pendencia"] != "agitar":
        estado["observacao_atual"] = "Nao ha mistura pendente para agitar no grupo 2."
        return

    if grupo2["fase"] == "pronto_para_mg":
        grupo2["fase"] = "precipitado_mg_formado"
        grupo2["pendencia"] = "centrifugar"
        estado["observacao_atual"] = (
            "Reagente precipitante: Reagente seletivo do Mg2+. Formou-se um precipitado branco de Mg2+. "
            "Centrifugue para separar o sobrenadante."
        )
        registrar_precipitacao(
            estado,
            nome_reagente="Reagente seletivo do Mg2+",
            formula_reagente="R-Mg",
            etapa=2,
            grupo="Grupo 2",
            precipitado="precipitado branco de Mg2+",
            ions=["Mg2+"],
            observacao="A agitacao revelou precipitado branco atribuido ao Mg2+.",
        )
        aplicar_visual(
            estado,
            cor_solucao="#c8d2d7",
            turva=True,
            precipitado=True,
            precipitado_cor="#efefe8",
            nivel=54,
        )
        return

    if grupo2["fase"] == "sobrenadante_mg":
        grupo2["fase"] = "carbonatos_formados"
        grupo2["pendencia"] = "centrifugar"
        estado["observacao_atual"] = (
            "Reagente precipitante: Carbonato de amonio ((NH4)2CO3). Ca2+ e Ba2+ precipitaram como "
            "carbonatos brancos. Centrifugue para concluir a separacao."
        )
        registrar_precipitacao(
            estado,
            nome_reagente="Carbonato de amonio",
            formula_reagente="(NH4)2CO3",
            etapa=2,
            grupo="Grupo 2",
            precipitado="carbonatos brancos de Ca2+ e Ba2+",
            ions=["Ca2+", "Ba2+", "CO3^2-"],
            observacao="A agitacao formou carbonatos brancos de Ca2+ e Ba2+ no grupo 2.",
        )
        aplicar_visual(
            estado,
            cor_solucao="#d8d6c8",
            turva=True,
            precipitado=True,
            precipitado_cor="#f1eee4",
            nivel=52,
        )


# centrifugacao separa precipitado e sobrenadante; a segunda conclui o grupo 2
def centrifugar(estado: dict) -> None:
    grupo2 = estado["grupo2"]

    if grupo2["pendencia"] != "centrifugar":
        estado["observacao_atual"] = "Nao ha mistura pronta para centrifugar no grupo 2."
        return

    if grupo2["fase"] == "precipitado_mg_formado":
        grupo2["fase"] = "sobrenadante_mg"
        grupo2["pendencia"] = None
        grupo2["magnesio_separado"] = True
        estado["observacao_atual"] = (
            "Mg2+ foi separado como precipitado branco. O sobrenadante segue com Ca2+ e Ba2+."
        )
        registrar_evento(estado, "Centrifugacao separou Mg2+ do sobrenadante do grupo 2.")
        aplicar_visual(
            estado,
            cor_solucao="#7e96a4",
            turva=False,
            precipitado=False,
            precipitado_cor="#efefe8",
            nivel=46,
        )
        return

    if grupo2["fase"] == "carbonatos_formados":
        grupo2["fase"] = "concluido"
        grupo2["pendencia"] = None
        grupo2["carbonatos_separados"] = True
        concluir_etapa(estado, 2)
        desbloquear_etapa(estado, 3)
        estado["etapa_corrente"] = 3
        estado["observacao_atual"] = (
            "Grupo 2 concluido. O precipitado branco final reteve Ca2+ e Ba2+, e a marcha segue para o grupo 3."
        )
        registrar_evento(estado, "Centrifugacao final do grupo 2 concluiu a separacao de Mg2+, Ca2+ e Ba2+.")
        estado["resumo_final"].append(
            "Grupo 2: Mg2+ precipitou primeiro; depois Ca2+ e Ba2+ foram separados do sobrenadante como carbonatos."
        )
        aplicar_visual(
            estado,
            cor_solucao="#7a8e9b",
            turva=False,
            precipitado=False,
            precipitado_cor="#f1eee4",
            nivel=48,
        )
