import os
from datetime import timedelta


# bloco do cors
def carregar_origens_cors() -> list[str]:
    origens_configuradas = os.getenv("CORS_ORIGINS", "").strip()
    if origens_configuradas:
        return [origem.strip() for origem in origens_configuradas.split(",") if origem.strip()]

    return [
        r"^https?://localhost(?::\d+)?$",
        r"^https?://127\.0\.0\.1(?::\d+)?$",
        r"^https?://\[::1\](?::\d+)?$",
    ]


# bloco do modo apresentacao
def carregar_usuarios_apresentacao() -> set[str]:
    nomes = os.getenv("USUARIOS_APRESENTACAO", "apresentacao")
    return {nome.strip() for nome in nomes.split(",") if nome.strip()}


# bloco de configuracao
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "TCCAlquimia2026")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///database.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "TCCAlquimia2026_jwt_secret_key_segura")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    CORS_ORIGINS = carregar_origens_cors()
    USUARIOS_APRESENTACAO = carregar_usuarios_apresentacao()
    PORT = int(os.getenv("PORT", "5000"))
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
