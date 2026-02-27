from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import User
from datetime import datetime
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    senha_hash = bcrypt.generate_password_hash(data["senha"]).decode("utf-8")

    novo_usuario = User(
        nome=data["nome"],
        senha_hash=senha_hash,
        data_criacao=datetime.utcnow()
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"message": "Usuário criado com sucesso"})

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    user = User.query.filter_by(nome=data["nome"]).first()

    if not user or not bcrypt.check_password_hash(user.senha_hash, data["senha"]):
        return jsonify({"error": "Credenciais inválidas"}), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login realizado com sucesso",
        "access_token": access_token
    })