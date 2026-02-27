from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Simulacao
from simulacao.engine import estado_inicial
from simulacao.base_quimica import sortear_cation
import json

bp = Blueprint("simulacao", __name__)


# Rota para iniciar simulação

@bp.route("/iniciar", methods=["POST"])
@jwt_required()
def iniciar_simulacao():

    user_id = int(get_jwt_identity())

    # Encerrar simulações antigas
    Simulacao.query.filter_by(usuario_id=user_id, ativa=True)\
        .update({"ativa": False})

    cation = sortear_cation()

    nova = Simulacao(
        usuario_id=user_id,
        cation_secreto=cation,
        estado_json=json.dumps(estado_inicial()),
        ativa=True
    )

    db.session.add(nova)
    db.session.commit()

    return jsonify({
        "mensagem": "Simulação iniciada",
        "estado": nova.get_estado()
    }), 201


# Rota de estado atual

@bp.route("/estado", methods=["GET"])
@jwt_required()
def ver_estado():

    user_id = int(get_jwt_identity())

    simulacao = Simulacao.query.filter_by(
        usuario_id=user_id,
        ativa=True
    ).first()

    if not simulacao:
        return jsonify({"error": "Nenhuma simulação ativa"}), 404

    return jsonify(simulacao.get_estado()), 200

# Rota para finalizar simulação

@bp.route("/finalizar", methods=["POST"])
@jwt_required()
def finalizar_simulacao():

    user_id = int(get_jwt_identity())

    simulacao = Simulacao.query.filter_by(
        usuario_id=user_id,
        ativa=True
    ).first()

    if not simulacao:
        return jsonify({"error": "Nenhuma simulação ativa"}), 404

    simulacao.ativa = False
    db.session.commit()

    return jsonify({
        "mensagem": "Simulação finalizada",
        "cation_secreto": simulacao.cation_secreto
    }), 200