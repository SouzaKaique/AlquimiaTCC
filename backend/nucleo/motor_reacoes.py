from models import Reacao


def estado_inicial_reacoes() -> dict:
    return {
        "reagentes": [],
        "ph": 7,
        "temperatura": 25,
        "cor": "incolor",
        "precipitados": [],
        "gases": [],
        "log": [],
    }


def aplicar_efeitos(estado: dict, efeitos: dict) -> dict:
    if "log" not in estado:
        estado["log"] = []

    delta_ph = efeitos.get("delta_ph", 0)
    if delta_ph != 0:
        estado["ph"] += delta_ph
        estado["log"].append(f"pH alterado em {delta_ph}")

    delta_temp = efeitos.get("delta_temp", 0)
    if delta_temp != 0:
        estado["temperatura"] += delta_temp
        estado["log"].append(f"Temperatura alterada em {delta_temp}C")

    estado["ph"] = max(0, min(14, estado["ph"]))
    estado["temperatura"] = max(0, estado["temperatura"])

    if efeitos.get("gera_precipitado"):
        cor_precipitado = efeitos.get("cor_precipitado", "desconhecida")
        estado["precipitados"].append({"cor": cor_precipitado})
        estado["log"].append(f"Formacao de precipitado {cor_precipitado}")

    if efeitos.get("gera_gas"):
        gas = efeitos.get("gas", "desconhecido")
        estado["gases"].append(gas)
        estado["log"].append(f"Liberacao de gas {gas}")

    if efeitos.get("muda_cor"):
        nova_cor = efeitos["muda_cor"]
        estado["cor"] = nova_cor
        estado["log"].append(f"Solucao mudou para cor {nova_cor}")

    return estado


def verificar_reacao(estado: dict, novo_reagente_id: int) -> dict:
    if "log" not in estado:
        estado["log"] = []

    if "reagentes" not in estado:
        estado["reagentes"] = []

    if not estado["reagentes"]:
        estado["reagentes"].append(novo_reagente_id)
        estado["log"].append(f"Primeiro reagente adicionado (ID {novo_reagente_id})")
        return estado

    ultimo = estado["reagentes"][-1]

    reacao = Reacao.query.filter(
        ((Reacao.reagente1_id == ultimo) & (Reacao.reagente2_id == novo_reagente_id))
        | ((Reacao.reagente1_id == novo_reagente_id) & (Reacao.reagente2_id == ultimo))
    ).first()

    estado["reagentes"].append(novo_reagente_id)

    if reacao:
        estado["log"].append(f"Reacao do tipo {reacao.tipo} detectada")
        efeitos = reacao.get_efeitos()
        return aplicar_efeitos(estado, efeitos)

    estado["log"].append("Nenhuma reacao detectada entre os reagentes")
    return estado
