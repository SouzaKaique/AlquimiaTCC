from typing import Any

from nucleo.gerenciador_estado import criar_estado_inicial, obter_estado_publico
from nucleo.operacoes_estado import desbloquear_etapa, registrar_evento
from regras.grupo1 import teste_chama
from regras.grupo2 import precipitacao
from regras.grupo3 import hidroxidos
from visual.estado_visual import atualizar_cena

# etapas da marcha: 0 introducao | 1 teste de chama | 2 grupo 2 | 3 grupo 3 | 4 relatorio

# passos de cada grupo, na ordem que o aluno faria. usado pelo modo apresentacao
# para "pular" grupos executando as mesmas regras (assim o relatorio fica completo)
ROTEIRO_COMPLETO = {
    1: [
        ("reagente", "Sal de potassio"),
        ("acao", "aquecer"),
        ("reagente", "Sal de sodio"),
        ("acao", "aquecer"),
        ("reagente", "Sal de estroncio"),
        ("acao", "aquecer"),
        ("acao", "confirmar_teste_chama"),
    ],
    2: [
        ("reagente", "Reagente precipitante do Mg2+"),
        ("acao", "agitar"),
        ("acao", "centrifugar"),
        ("reagente", "Carbonato de amonio"),
        ("acao", "agitar"),
        ("acao", "centrifugar"),
    ],
    3: [
        ("reagente", "NH4Cl"),
        ("reagente", "NH4OH"),
        ("acao", "agitar"),
        ("acao", "centrifugar"),
        ("reagente", "Dimetilglioxima"),
        ("acao", "agitar"),
        ("acao", "centrifugar"),
    ],
}


# ---------- reagente colocado no tubo ----------
# escolhe a regra pelo grupo da etapa atual
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


# ---------- acoes da bancada ----------
# cada acao so vale na etapa certa (ex.: aquecer so no grupo 1)
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
    elif acao == "confirmar_teste_chama" and etapa == 1:
        teste_chama.confirmar_conclusao(estado)
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


# ---------- modo apresentacao ----------
# monta uma marcha nova ja parada na etapa escolhida.
# os grupos anteriores sao executados automaticamente pelo ROTEIRO_COMPLETO
def ir_para_etapa(etapa_destino: int) -> dict[str, Any]:
    estado = criar_estado_inicial()
    if etapa_destino == 0:
        return estado

    executar_acao(estado, "iniciar_roteiro")

    for grupo in range(1, etapa_destino):
        for tipo, valor in ROTEIRO_COMPLETO[grupo]:
            if tipo == "reagente":
                aplicar_reagente_marcha(estado, valor)
            else:
                executar_acao(estado, valor)

    registrar_evento(estado, f"Modo apresentacao: marcha posicionada na etapa {etapa_destino}.")
    atualizar_cena(estado)
    return estado


# classe usada pelo motor; guarda o estado e chama as funcoes acima
class MarchaAnalitica:
    def __init__(self, estado: dict[str, Any] | None = None):
        # sem estado salvo (ou estado antigo invalido) comeca uma marcha limpa
        self.estado = estado if estado and "etapa_corrente" in estado else criar_estado_inicial()

    def aplicar_reagente(self, reagente: str) -> dict[str, Any]:
        self.estado = aplicar_reagente_marcha(self.estado, reagente)
        return self.estado

    def executar_acao(self, acao: str) -> dict[str, Any]:
        self.estado = executar_acao(self.estado, acao)
        return self.estado

    def ir_para_etapa(self, etapa: int) -> dict[str, Any]:
        self.estado = ir_para_etapa(etapa)
        return self.estado

    def obter_estado(self) -> dict[str, Any]:
        return self.estado

    def obter_estado_publico(self) -> dict[str, Any]:
        return obter_estado_publico(self.estado)
