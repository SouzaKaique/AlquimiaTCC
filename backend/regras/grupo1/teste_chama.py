from dados.catalogos_marcha import FLAME_SAMPLES
from nucleo.operacoes_estado import concluir_etapa, desbloquear_etapa, registrar_evento
from visual.estado_visual import aplicar_visual


RESUMO_GRUPO_1 = "Grupo 1: K, Na e Sr foram diferenciados com clareza pelo teste de chama."


def aplicar_reagente(estado: dict, reagente: str) -> None:
    if reagente not in FLAME_SAMPLES:
        estado["observacao_atual"] = "Use um sal conhecido no teste de chama do grupo 1."
        return

    estado["grupo1"]["amostra_atual"] = reagente
    estado["grupo1"]["pendencia"] = "aquecer"
    estado["teste_chama"]["ativa"] = False
    estado["teste_chama"]["cor"] = None
    estado["teste_chama"]["mensagem"] = "Tubo preparado para aquecimento."
    estado["teste_chama"]["aguardando_confirmacao"] = False
    registrar_evento(estado, f"{reagente} colocado no tubo para teste de chama.")
    estado["observacao_atual"] = "Reagente no tubo. Acenda o bico e aproxime o tubo."
    aplicar_visual(
        estado,
        cor_solucao="#8697a2",
        turva=False,
        precipitado=False,
        precipitado_cor="#d7d3c8",
        nivel=42,
    )


def aquecer(estado: dict) -> None:
    amostra = estado["grupo1"]["amostra_atual"]
    if not amostra:
        estado["observacao_atual"] = "Escolha um sal antes de aquecer."
        return

    dados = FLAME_SAMPLES[amostra]
    estado["teste_chama"]["ativa"] = True
    estado["teste_chama"]["cor"] = dados["flame_color"]
    estado["teste_chama"]["mensagem"] = dados["resultado"]
    estado["teste_chama"]["aguardando_confirmacao"] = False
    estado["grupo1"]["pendencia"] = None

    if amostra not in estado["grupo1"]["testadas"]:
        estado["grupo1"]["testadas"].append(amostra)

    registrar_evento(estado, dados["resultado"])
    estado["observacao_atual"] = dados["resultado"]

    if len(estado["grupo1"]["testadas"]) == len(FLAME_SAMPLES):
        estado["teste_chama"]["aguardando_confirmacao"] = True
        estado["observacao_atual"] = (
            f"{dados['resultado']} Teste de chama concluido. Confirme para seguir para a proxima analise."
        )


def confirmar_conclusao(estado: dict) -> None:
    if not estado["teste_chama"].get("aguardando_confirmacao"):
        estado["observacao_atual"] = "Conclua os tres sais do teste de chama antes de seguir."
        return

    concluir_etapa(estado, 1)
    if RESUMO_GRUPO_1 not in estado["resumo_final"]:
        estado["resumo_final"].append(RESUMO_GRUPO_1)

    estado["teste_chama"]["ativa"] = False
    estado["teste_chama"]["cor"] = None
    estado["teste_chama"]["aguardando_confirmacao"] = False
    estado["teste_chama"]["mensagem"] = "Teste de chama concluido."
    estado["etapa_corrente"] = 2
    desbloquear_etapa(estado, 2)
    estado["observacao_atual"] = (
        "Grupo 1 concluido. Agora a marcha segue com a solucao-mae do grupo 2 e separacao por centrifugacao."
    )
    registrar_evento(estado, "Teste de chama do grupo 1 confirmado. Grupo 2 liberado.")


def desligar_chama(estado: dict) -> None:
    estado["teste_chama"]["ativa"] = False
    estado["teste_chama"]["cor"] = None
    estado["teste_chama"]["mensagem"] = "Chama desligada."
    estado["teste_chama"]["aguardando_confirmacao"] = False
    estado["observacao_atual"] = "Chama desligada. Escolha outro sal conhecido quando quiser."
    registrar_evento(estado, "A chama do grupo 1 foi desligada na bancada.")
