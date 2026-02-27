from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Reagente

reagentes_bp = Blueprint("reagentes", __name__)

# CRUD para Reagentes

# Criar reagente
@reagentes_bp.route("/", methods=["POST"])
@jwt_required()
def criar_reagente():
    data = request.get_json()

    if not data:
        return jsonify({"erro": "Dados não enviados"}), 400

    if "nome" not in data:
        return jsonify({"erro": "O campo 'nome' é obrigatório"}), 400

    novo = Reagente(
        nome=data["nome"],
        formula=data.get("formula"),
        descricao=data.get("descricao"),
        toxicidade=data.get("toxicidade"),
        grupo=data.get("grupo")
    )

    db.session.add(novo)
    db.session.commit()

    return jsonify({
        "message": "Reagente criado com sucesso",
        "reagente": novo.to_dict()
    }), 201


# Listar reagentes
@reagentes_bp.route("/", methods=["GET"])
@jwt_required()
def listar_reagentes():
    reagentes = Reagente.query.all()
    return jsonify([r.to_dict() for r in reagentes]), 200


# Atualizar reagente
@reagentes_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_reagente(id):
    reagente = Reagente.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"erro": "Dados não enviados"}), 400

    reagente.nome = data.get("nome", reagente.nome)
    reagente.formula = data.get("formula", reagente.formula)
    reagente.descricao = data.get("descricao", reagente.descricao)
    reagente.toxicidade = data.get("toxicidade", reagente.toxicidade)
    reagente.grupo = data.get("grupo", reagente.grupo)

    db.session.commit()

    return jsonify({
        "message": "Reagente atualizado com sucesso",
        "reagente": reagente.to_dict()
    }), 200


# Deletar reagente
@reagentes_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_reagente(id):
    reagente = Reagente.query.get_or_404(id)

    db.session.delete(reagente)
    db.session.commit()

    return jsonify({"message": "Reagente deletado com sucesso"}), 200