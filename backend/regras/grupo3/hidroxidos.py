from nucleo.operacoes_estado import (
    concluir_etapa,
    desbloquear_etapa,
    registrar_evento,
    registrar_precipitacao,
    registrar_reagente_utilizado,
)
from visual.estado_visual import aplicar_visual


# grupo 3 - Fe3+, Al3+ e Ni2+
# fases: pronto_para_nh4cl -> pronto_para_nh4oh -> mistura_hidroxidos -> hidroxidos_formados
#        -> sobrenadante_ni -> confirmacao_ni -> ni_precipitado -> concluido


# NH4Cl -> NH4OH -> (depois da centrifugacao) dimetilglioxima
def aplicar_reagente(estado: dict, reagente: str) -> None:
    grupo3 = estado["grupo3"]

    if reagente == "NH4Cl" and grupo3["fase"] == "pronto_para_nh4cl":
        registrar_reagente_utilizado(estado, reagente)
        grupo3["nh4cl_adicionado"] = True
        grupo3["fase"] = "pronto_para_nh4oh"
        estado["observacao_atual"] = "NH4Cl adicionado. Agora use NH4OH para iniciar a precipitacao dos hidroxidos."
        registrar_evento(estado, "NH4Cl adicionado ao grupo 3.")
        return

    if reagente == "NH4OH" and grupo3["fase"] == "pronto_para_nh4oh":
        registrar_reagente_utilizado(estado, reagente)
        grupo3["nh4oh_adicionado"] = True
        grupo3["fase"] = "mistura_hidroxidos"
        grupo3["pendencia"] = "agitar"
        estado["observacao_atual"] = "NH4OH adicionado. Agite para formar os hidroxidos insoluveis."
        registrar_evento(estado, "NH4OH adicionado ao grupo 3.")
        return

    if reagente == "Dimetilglioxima" and grupo3["fase"] == "sobrenadante_ni":
        registrar_reagente_utilizado(estado, reagente)
        grupo3["fase"] = "confirmacao_ni"
        grupo3["pendencia"] = "agitar"
        estado["observacao_atual"] = (
            "Dimetilglioxima adicionada. Agite para confirmar Ni2+ por precipitado vermelho."
        )
        registrar_evento(estado, "Dimetilglioxima adicionada ao sobrenadante do grupo 3.")
        return

    estado["observacao_atual"] = "Esse reagente nao corresponde ao passo atual do grupo 3."


# agitacao forma os hidroxidos de Fe/Al ou o precipitado vermelho de Ni com DMG
def agitar(estado: dict) -> None:
    grupo3 = estado["grupo3"]

    if grupo3["pendencia"] != "agitar":
        estado["observacao_atual"] = "Nao ha etapa pendente de agitacao no grupo 3."
        return

    if grupo3["fase"] == "mistura_hidroxidos":
        grupo3["fase"] = "hidroxidos_formados"
        grupo3["pendencia"] = "centrifugar"
        estado["observacao_atual"] = (
            "Reagente precipitante: NH4OH. A agitacao revelou hidroxidos marrom e branco gelatinoso. "
            "Centrifugue para isolar o precipitado."
        )
        registrar_precipitacao(
            estado,
            nome_reagente="NH4OH",
            formula_reagente="NH4OH",
            etapa=3,
            grupo="Grupo 3",
            precipitado="hidroxidos de Fe3+ e Al3+",
            ions=["Fe3+", "Al3+", "OH-"],
            observacao="Fe3+ e Al3+ formaram hidroxidos insoluveis no grupo 3.",
        )
        aplicar_visual(
            estado,
            cor_solucao="#98785d",
            turva=True,
            precipitado=True,
            precipitado_cor="#b89262",
            nivel=56,
        )
        return

    if grupo3["fase"] == "confirmacao_ni":
        grupo3["fase"] = "ni_precipitado"
        grupo3["pendencia"] = "centrifugar"
        estado["observacao_atual"] = (
            "Reagente precipitante: dimetilglioxima. A mistura ficou com precipitado vermelho, confirmando "
            "Ni2+ no sobrenadante."
        )
        registrar_precipitacao(
            estado,
            nome_reagente="Dimetilglioxima",
            formula_reagente="DMG",
            etapa=3,
            grupo="Grupo 3",
            precipitado="precipitado vermelho de Ni2+",
            ions=["Ni2+", "DMG"],
            observacao="A dimetilglioxima confirmou Ni2+ por precipitado vermelho.",
        )
        aplicar_visual(
            estado,
            cor_solucao="#b37a88",
            turva=True,
            precipitado=True,
            precipitado_cor="#c45462",
            nivel=52,
        )


# primeira centrifugacao isola Fe/Al; a segunda conclui o grupo 3 e abre o relatorio
def centrifugar(estado: dict) -> None:
    grupo3 = estado["grupo3"]

    if grupo3["pendencia"] != "centrifugar":
        estado["observacao_atual"] = "Nao ha mistura pronta para centrifugar no grupo 3."
        return

    if grupo3["fase"] == "hidroxidos_formados":
        grupo3["fase"] = "sobrenadante_ni"
        grupo3["pendencia"] = None
        grupo3["hidroxidos_separados"] = True
        estado["observacao_atual"] = (
            "O precipitado reteve Fe3+ e Al3+. O sobrenadante segue para confirmacao de Ni2+ com DMG."
        )
        registrar_evento(estado, "Centrifugacao separou Fe3+ e Al3+ do sobrenadante do grupo 3.")
        aplicar_visual(
            estado,
            cor_solucao="#7f97a8",
            turva=False,
            precipitado=False,
            precipitado_cor="#b89262",
            nivel=44,
        )
        return

    if grupo3["fase"] == "ni_precipitado":
        grupo3["fase"] = "concluido"
        grupo3["pendencia"] = None
        grupo3["ni_confirmado"] = True
        concluir_etapa(estado, 3)
        desbloquear_etapa(estado, 4)
        estado["etapa_corrente"] = 4
        estado["observacao_atual"] = (
            "Grupo 3 concluido. O roteiro esta pronto para o relatorio final das separacoes."
        )
        registrar_evento(estado, "Centrifugacao final do grupo 3 concluiu a identificacao das fracoes separadas.")
        estado["resumo_final"].append(
            "Grupo 3: Fe3+ e Al3+ ficaram no precipitado de hidroxidos; Ni2+ foi confirmado depois no sobrenadante com DMG."
        )
        aplicar_visual(
            estado,
            cor_solucao="#7a8e9b",
            turva=False,
            precipitado=False,
            precipitado_cor="#c45462",
            nivel=46,
        )
