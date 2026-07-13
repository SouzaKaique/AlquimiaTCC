from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import inspect, text

from config import Config
from extensions import bcrypt, db, jwt
from routes.auth import auth_bp
from routes.historico import historico_bp
from routes.reacoes import reacoes_bp
from routes.reagentes import reagentes_bp
from routes.simulacao import bp as simulacao_bp


def create_app(configuracao: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    if configuracao:
        app.config.update(configuracao)

    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(reagentes_bp, url_prefix="/reagentes")
    app.register_blueprint(reacoes_bp, url_prefix="/reacoes")
    app.register_blueprint(historico_bp, url_prefix="/historico")
    app.register_blueprint(simulacao_bp, url_prefix="/simulacao")

    registrar_rotas_sistema(app)
    registrar_callbacks(app)
    return app


def registrar_rotas_sistema(app: Flask) -> None:
    @app.route("/")
    def home():
        return {"message": "Backend Alquimia rodando"}

    @app.route("/saude")
    def saude():
        return {"status": "ok", "servico": "alquimia-api"}


def registrar_callbacks(app: Flask) -> None:
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Token invalido.", "detalhe": error}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Token ausente.", "detalhe": error}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token expirado."}), 401


def ensure_legacy_schema() -> None:
    inspector = inspect(db.engine)

    if "simulacao" in inspector.get_table_names():
        simulacao_columns = {column["name"] for column in inspector.get_columns("simulacao")}

        if "data_inicio" not in simulacao_columns:
            db.session.execute(text("ALTER TABLE simulacao ADD COLUMN data_inicio DATETIME"))

        if "data_fim" not in simulacao_columns:
            db.session.execute(text("ALTER TABLE simulacao ADD COLUMN data_fim DATETIME"))

    if "historico" in inspector.get_table_names():
        historico_columns = {column["name"] for column in inspector.get_columns("historico")}

        colunas_historico = {
            "usuario_id": "INTEGER",
            "reagente1_id": "INTEGER",
            "reagente2_id": "INTEGER",
            "resultado": "VARCHAR(255)",
            "explicacao": "TEXT",
            "simulacao_id": "INTEGER",
            "acao": "VARCHAR(100)",
            "descricao": "TEXT",
        }

        for coluna, tipo in colunas_historico.items():
            if coluna not in historico_columns:
                db.session.execute(text(f"ALTER TABLE historico ADD COLUMN {coluna} {tipo}"))

    db.session.commit()


app = create_app()


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        ensure_legacy_schema()

    app.run(debug=app.config["DEBUG"], port=app.config["PORT"])
