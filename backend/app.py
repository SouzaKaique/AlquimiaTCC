from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, bcrypt, jwt
from routes.auth import auth_bp
from routes.reagentes import reagentes_bp
from routes.reacoes import reacoes_bp
from routes.historico import historico_bp
from routes.simulacao import bp as simulacao_bp


app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

from models import *

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(reagentes_bp, url_prefix="/reagentes")
app.register_blueprint(reacoes_bp, url_prefix="/reacoes")
app.register_blueprint(historico_bp, url_prefix="/historico")
app.register_blueprint(simulacao_bp, url_prefix="/simulacao")

@app.route("/")
def home():
    return {"message": "Backend Alquimia rodando"}

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)