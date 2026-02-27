from models import Reacao
import json
from simulacao.engine import aplicar_efeitos, verificar_reacao

def estado_inicial():
    return {
        "reagentes": [],
        "ph": 7,
        "temperatura": 25,
        "cor": "incolor",
        "precipitados": [],
        "gases": [],
        "log": []
    }


def aplicar_efeitos(estado, efeitos):

    # Garantir que exista log

    if "log" not in estado:
        estado["log"] = []

    # Alterações de pH

    delta_ph = efeitos.get("delta_ph", 0)
    if delta_ph != 0:
        estado["ph"] += delta_ph
        estado["log"].append(f"pH alterado em {delta_ph}")

    # Alterações de temperatura

    delta_temp = efeitos.get("delta_temp", 0)
    if delta_temp != 0:
        estado["temperatura"] += delta_temp
        estado["log"].append(f"Temperatura alterada em {delta_temp}°C")

    #Limites científicos para pH e temperatura

    estado["ph"] = max(0, min(14, estado["ph"]))
    estado["temperatura"] = max(0, estado["temperatura"])

    # Formação de precipitado

    if efeitos.get("gera_precipitado"):
        cor_precipitado = efeitos.get("cor_precipitado", "desconhecida")

        estado["precipitados"].append({
            "cor": cor_precipitado
        })

        estado["log"].append(
            f"Formação de precipitado {cor_precipitado}"
        )

    # Liberação de gás

    if efeitos.get("gera_gas"):
        gas = efeitos.get("gas", "desconhecido")

        estado["gases"].append(gas)

        estado["log"].append(
            f"Liberação de gás {gas}"
        )

    # Mudança de cor da solução

    if efeitos.get("muda_cor"):
        nova_cor = efeitos["muda_cor"]
        estado["cor"] = nova_cor

        estado["log"].append(
            f"Solução mudou para cor {nova_cor}"
        )

    return estado


def verificar_reacao(estado, novo_reagente_id):

    # Garantir log

    if "log" not in estado:
        estado["log"] = []

    # Se não tiver reagente anterio vai adicionar

    if not estado["reagentes"]:
        estado["reagentes"].append(novo_reagente_id)
        estado["log"].append(
            f"Primeiro reagente adicionado (ID {novo_reagente_id})"
        )
        return estado

    # Pega último reagente

    ultimo = estado["reagentes"][-1]

    # Procura reação em qualquer ordem

    reacao = Reacao.query.filter(
        ((Reacao.reagente1_id == ultimo) &
         (Reacao.reagente2_id == novo_reagente_id)) |
        ((Reacao.reagente1_id == novo_reagente_id) &
         (Reacao.reagente2_id == ultimo))
    ).first()

    # Adiciona reagente ao estado

    estado["reagentes"].append(novo_reagente_id)

    if reacao:
        estado["log"].append(
            f"Reação do tipo {reacao.tipo} detectada"
        )

        efeitos = reacao.get_efeitos()
        estado = aplicar_efeitos(estado, efeitos)

    else:
        estado["log"].append(
            "Nenhuma reação detectada entre os reagentes"
        )

    return estado