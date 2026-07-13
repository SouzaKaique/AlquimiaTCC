from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from extensions import bcrypt, db
from models import User
from nucleo.tempo import agora_utc

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    nome = (data.get("nome") or data.get("usuario") or "").strip()
    senha = data.get("senha") or ""

    if not nome or not senha:
        return jsonify({"error": "Nome e senha sao obrigatorios."}), 400

    existente = User.query.filter_by(nome=nome).first()
    if existente:
        return jsonify({"error": "Ja existe um usuario com esse nome."}), 409

    senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")

    novo_usuario = User(
        nome=nome,
        senha_hash=senha_hash,
        data_criacao=agora_utc(),
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"message": "Usuario criado com sucesso."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    nome = (data.get("nome") or data.get("usuario") or "").strip()
    senha = data.get("senha") or ""

    if not nome or not senha:
        return jsonify({"error": "Nome e senha sao obrigatorios."}), 400

    user = User.query.filter_by(nome=nome).first()

    if not user or not bcrypt.check_password_hash(user.senha_hash, senha):
        return jsonify({"error": "Credenciais invalidas."}), 401

    access_token = create_access_token(identity=str(user.id))

    return (
        jsonify(
            {
                "message": "Login realizado com sucesso.",
                "access_token": access_token,
                "usuario": {"id": user.id, "nome": user.nome},
            }
        ),
        200,
    )
