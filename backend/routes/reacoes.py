from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Reagente
from servicos.servico_simulacao import ServicoSimulacao

reacoes_bp = Blueprint("reacoes", __name__)
servico_simulacao = ServicoSimulacao()


@reacoes_bp.route("/adicionar", methods=["POST"])
@jwt_required()
def adicionar_reagente():
    data = request.get_json(silent=True) or {}
    reagente_id = data.get("reagente_id")

    if not reagente_id:
        return jsonify({"error": "Selecione um reagente"}), 400

    reagente = db.session.get(Reagente, reagente_id)
    if not reagente:
        return jsonify({"error": "Reagente nao encontrado"}), 404

    resposta = servico_simulacao.aplicar_reagente(
        usuario_id=int(get_jwt_identity()),
        reagente=reagente.nome,
    )

    if not resposta:
        return jsonify({"error": "Nenhuma simulacao ativa"}), 400

    return jsonify(resposta["estado"]), 200
