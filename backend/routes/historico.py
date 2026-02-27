from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Historico, Reagente
from datetime import datetime

historico_bp = Blueprint("historico", __name__)


# Lista o histórico de reações do usuário
@historico_bp.route("/", methods=["GET"])
@jwt_required()
def listar_historico():
    user_id = int(get_jwt_identity())

    historicos = Historico.query.filter_by(usuario_id=user_id)\
        .order_by(Historico.data.desc())\
        .all()

    resultado = []

    for item in historicos:
        reagente1 = Reagente.query.get(item.reagente1_id)
        reagente2 = Reagente.query.get(item.reagente2_id)

        resultado.append({
            "id": item.id,
            "reagente1": reagente1.nome if reagente1 else None,
            "reagente2": reagente2.nome if reagente2 else None,
            "reagente1_id": item.reagente1_id,
            "reagente2_id": item.reagente2_id,
            "data": item.data.strftime("%d/%m/%Y %H:%M:%S") if item.data else None
        })

    return jsonify(resultado), 200


# Deleta um registro específico do histórico do usuário
@historico_bp.route("/<int:historico_id>", methods=["DELETE"])
@jwt_required()
def deletar_historico(historico_id):
    user_id = int(get_jwt_identity())

    historico = Historico.query.filter_by(
        id=historico_id,
        usuario_id=user_id
    ).first()

    if not historico:
        return jsonify({"error": "Registro não encontrado"}), 404

    db.session.delete(historico)
    db.session.commit()

    return jsonify({"message": "Registro removido com sucesso"}), 200


# Limpa o histórico do usuário 
@historico_bp.route("/limpar", methods=["DELETE"])
@jwt_required()
def limpar_historico():
    user_id = int(get_jwt_identity())

    Historico.query.filter_by(usuario_id=user_id).delete()
    db.session.commit()

    return jsonify({"message": "Histórico limpo com sucesso"}), 200