from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token

from extensions import bcrypt, db
from models import Usuario
from nucleo.tempo import agora_utc

auth_bp = Blueprint("auth", __name__)


# bloco do cadastro
@auth_bp.route("/register", methods=["POST"])
def registrar():
    data = request.get_json(silent=True) or {}

    nome = (data.get("nome") or data.get("usuario") or "").strip()
    senha = data.get("senha") or ""

    if not nome or not senha:
        return jsonify({"error": "Nome e senha sao obrigatorios."}), 400

    existente = Usuario.query.filter_by(nome=nome).first()
    if existente:
        return jsonify({"error": "Ja existe um usuario com esse nome."}), 409

    senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")

    novo_usuario = Usuario(
        nome=nome,
        senha_hash=senha_hash,
        data_criacao=agora_utc(),
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"message": "Usuario criado com sucesso."}), 201


# bloco do login
@auth_bp.route("/login", methods=["POST"])
def entrar():
    data = request.get_json(silent=True) or {}

    nome = (data.get("nome") or data.get("usuario") or "").strip()
    senha = data.get("senha") or ""

    if not nome or not senha:
        return jsonify({"error": "Nome e senha sao obrigatorios."}), 400

    usuario = Usuario.query.filter_by(nome=nome).first()

    if not usuario or not bcrypt.check_password_hash(usuario.senha_hash, senha):
        return jsonify({"error": "Credenciais invalidas."}), 401

    access_token = create_access_token(identity=str(usuario.id))

    return (
        jsonify(
            {
                "message": "Login realizado com sucesso.",
                "access_token": access_token,
                "usuario": {
                    "id": usuario.id,
                    "nome": usuario.nome,
                    "apresentador": eh_apresentador(usuario),
                },
            }
        ),
        200,
    )


# bloco do modo apresentacao
def eh_apresentador(usuario: Usuario | None) -> bool:
    return bool(usuario) and usuario.nome in current_app.config["USUARIOS_APRESENTACAO"]
