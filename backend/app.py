from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import inspect, text

from config import Config
from extensions import bcrypt, db, jwt
from routes.auth import auth_bp
from routes.simulacao import bp as simulacao_bp


# monta a aplicacao flask: config, cors, extensoes e rotas
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
    app.register_blueprint(simulacao_bp, url_prefix="/simulacao")

    registrar_rotas_sistema(app)
    registrar_callbacks(app)
    return app


# rotas simples usadas para conferir se o backend esta no ar
def registrar_rotas_sistema(app: Flask) -> None:
    @app.route("/")
    def pagina_inicial():
        return {"message": "Backend Alquimia rodando"}

    @app.route("/saude")
    def saude():
        return {"status": "ok", "servico": "alquimia-api"}


# respostas padrao quando o token jwt esta ausente, invalido ou expirado
def registrar_callbacks(app: Flask) -> None:
    @jwt.invalid_token_loader
    def retorno_token_invalido(erro):
        return jsonify({"error": "Token invalido.", "detalhe": erro}), 401

    @jwt.unauthorized_loader
    def retorno_token_ausente(erro):
        return jsonify({"error": "Token ausente.", "detalhe": erro}), 401

    @jwt.expired_token_loader
    def retorno_token_expirado(cabecalho_jwt, carga_jwt):
        return jsonify({"error": "Token expirado."}), 401


# adiciona colunas novas em bancos sqlite criados antes delas existirem
def garantir_esquema_legado() -> None:
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
        garantir_esquema_legado()

    app.run(debug=app.config["DEBUG"], port=app.config["PORT"])
