from typing import Any

from nucleo.gerenciador_estado import criar_estado_inicial, obter_estado_publico
from nucleo.operacoes_estado import desbloquear_etapa, registrar_evento
from regras.grupo1 import teste_chama
from regras.grupo2 import precipitacao
from regras.grupo3 import hidroxidos
from visual.estado_visual import atualizar_cena


def aplicar_reagente_marcha(estado: dict[str, Any], reagente: str) -> dict[str, Any]:
    etapa = estado["etapa_corrente"]

    if etapa == 1:
        teste_chama.aplicar_reagente(estado, reagente)
    elif etapa == 2:
        precipitacao.aplicar_reagente(estado, reagente)
    elif etapa == 3:
        hidroxidos.aplicar_reagente(estado, reagente)
    else:
        estado["observacao_atual"] = "Esta etapa nao aceita reagentes neste momento."

    atualizar_cena(estado)
    return estado


def executar_acao(estado: dict[str, Any], acao: str) -> dict[str, Any]:
    etapa = estado["etapa_corrente"]

    if acao == "iniciar_roteiro" and etapa == 0:
        registrar_evento(estado, "Roteiro iniciado. A bancada foi preparada com o grupo 1.")
        estado["etapa_corrente"] = 1
        estado["observacao_atual"] = (
            "Grupo 1: arraste um sal conhecido para o tubo e aqueca para observar a coloracao da chama."
        )
        desbloquear_etapa(estado, 1)
    elif acao == "aquecer" and etapa == 1:
        teste_chama.aquecer(estado)
    elif acao == "desligar_chama" and etapa == 1:
        teste_chama.desligar_chama(estado)
    elif acao == "agitar" and etapa == 2:
        precipitacao.agitar(estado)
    elif acao == "centrifugar" and etapa == 2:
        precipitacao.centrifugar(estado)
    elif acao == "agitar" and etapa == 3:
        hidroxidos.agitar(estado)
    elif acao == "centrifugar" and etapa == 3:
        hidroxidos.centrifugar(estado)
    else:
        estado["observacao_atual"] = "Essa acao nao esta disponivel agora."

    atualizar_cena(estado)
    return estado


class MarchaAnalitica:
    def __init__(self, estado: dict[str, Any] | None = None):
        self.estado = estado if estado and "etapa_corrente" in estado else criar_estado_inicial()

    def aplicar_reagente(self, reagente: str) -> dict[str, Any]:
        self.estado = aplicar_reagente_marcha(self.estado, reagente)
        return self.estado

    def executar_acao(self, acao: str) -> dict[str, Any]:
        self.estado = executar_acao(self.estado, acao)
        return self.estado

    def obter_estado(self) -> dict[str, Any]:
        return self.estado

    def obter_estado_publico(self) -> dict[str, Any]:
        return obter_estado_publico(self.estado)
