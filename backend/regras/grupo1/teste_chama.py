from dados.catalogos_marcha import FLAME_SAMPLES
from nucleo.operacoes_estado import concluir_etapa, desbloquear_etapa, registrar_evento
from visual.estado_visual import aplicar_visual


def aplicar_reagente(estado: dict, reagente: str) -> None:
    if reagente not in FLAME_SAMPLES:
        estado["observacao_atual"] = "Use um sal conhecido no teste de chama do grupo 1."
        return

    estado["grupo1"]["amostra_atual"] = reagente
    estado["grupo1"]["pendencia"] = "aquecer"
    estado["teste_chama"]["ativa"] = False
    estado["teste_chama"]["cor"] = None
    estado["teste_chama"]["mensagem"] = "Tubo preparado para aquecimento."
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
    estado["grupo1"]["pendencia"] = None

    if amostra not in estado["grupo1"]["testadas"]:
        estado["grupo1"]["testadas"].append(amostra)

    registrar_evento(estado, dados["resultado"])
    estado["observacao_atual"] = dados["resultado"]

    if len(estado["grupo1"]["testadas"]) == len(FLAME_SAMPLES):
        concluir_etapa(estado, 1)
        estado["resumo_final"].append(
            "Grupo 1: K, Na e Sr foram diferenciados com clareza pelo teste de chama."
        )
        estado["etapa_corrente"] = 2
        desbloquear_etapa(estado, 2)
        estado["observacao_atual"] = (
            "Grupo 1 concluido. Agora a marcha segue com a solucao-mae do grupo 2 e separacao por centrifugacao."
        )


def desligar_chama(estado: dict) -> None:
    estado["teste_chama"]["ativa"] = False
    estado["teste_chama"]["cor"] = None
    estado["teste_chama"]["mensagem"] = "Chama desligada."
    estado["observacao_atual"] = "Chama desligada. Escolha outro sal conhecido quando quiser."
    registrar_evento(estado, "A chama do grupo 1 foi desligada na bancada.")
