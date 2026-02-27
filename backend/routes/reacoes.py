from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Simulacao
from simulacao.engine import verificar_e_aplicar_reacao

reacoes_bp = Blueprint("reacoes", __name__)


@reacoes_bp.route("/adicionar", methods=["POST"])
@jwt_required()
def adicionar_reagente():

    data = request.get_json()
    user_id = int(get_jwt_identity())

    reagente_id = data.get("reagente_id")

    if not reagente_id:
        return jsonify({"error": "Selecione um reagente"}), 400

    simulacao = Simulacao.query.filter_by(
        usuario_id=user_id,
        ativa=True
    ).first()

    if not simulacao:
        return jsonify({"error": "Nenhuma simulação ativa"}), 400

    estado = simulacao.get_estado()

    estado_atualizado = verificar_e_aplicar_reacao(
        estado,
        reagente_id
    )

    simulacao.set_estado(estado_atualizado)
    db.session.commit()

    return jsonify(estado_atualizado), 200