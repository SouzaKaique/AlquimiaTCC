from extensions import db
from datetime import datetime
import json


class User(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

class Reagente(db.Model):
    __tablename__ = "reagentes"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    formula = db.Column(db.String(100))
    descricao = db.Column(db.Text)
    toxicidade = db.Column(db.Integer)
    grupo = db.Column(db.String(50))

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "formula": self.formula,
            "descricao": self.descricao,
            "toxicidade": self.toxicidade,
            "grupo": self.grupo
        }


class Reacao(db.Model):
    __tablename__ = "reacoes"

    id = db.Column(db.Integer, primary_key=True)

    reagente1_id = db.Column(db.Integer, db.ForeignKey('reagentes.id'), nullable=False)
    reagente2_id = db.Column(db.Integer, db.ForeignKey('reagentes.id'), nullable=False)

    tipo = db.Column(db.String(50), nullable=False)

    # Aqui ficam os efeitos estruturados da reação
    efeitos_json = db.Column(db.Text, nullable=False)

    def get_efeitos(self):
        return json.loads(self.efeitos_json)


class Historico(db.Model):
    __tablename__ = "historico"

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(db.Integer, nullable=False)

    reagente1_id = db.Column(db.Integer, db.ForeignKey("reagentes.id"), nullable=False)
    reagente2_id = db.Column(db.Integer, db.ForeignKey("reagentes.id"), nullable=False)

    resultado = db.Column(db.String(255))
    explicacao = db.Column(db.Text)

    data = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "reagente1_id": self.reagente1_id,
            "reagente2_id": self.reagente2_id,
            "resultado": self.resultado,
            "explicacao": self.explicacao,
            "data": self.data.isoformat()
        }


class Simulacao(db.Model):
    __tablename__ = "simulacao"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)

    cation_secreto = db.Column(db.String(10), nullable=False)

    estado_json = db.Column(db.Text, nullable=False)

    ativa = db.Column(db.Boolean, default=True)

    def get_estado(self):
        return json.loads(self.estado_json)

    def set_estado(self, estado_dict):
        self.estado_json = json.dumps(estado_dict)