from extensions import db

from nucleo.tempo import agora_utc


# bloco do usuario
class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    data_criacao = db.Column(db.DateTime, default=agora_utc)

    simulacoes = db.relationship("Simulacao", backref="usuario", lazy=True)


# bloco dos reagentes
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


# bloco das reacoes
class Reacao(db.Model):
    __tablename__ = "reacoes"

    id = db.Column(db.Integer, primary_key=True)

    reagente1_id = db.Column(db.Integer, db.ForeignKey('reagentes.id'), nullable=False)
    reagente2_id = db.Column(db.Integer, db.ForeignKey('reagentes.id'), nullable=False)

    tipo = db.Column(db.String(50), nullable=False)
    efeitos_json = db.Column(db.Text, nullable=False)


# bloco da simulacao
class Simulacao(db.Model):
    __tablename__ = "simulacao"

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)

    cation_secreto = db.Column(db.String(50), nullable=False)

    estado_json = db.Column(db.Text, nullable=False)

    ativa = db.Column(db.Boolean, default=True)

    data_inicio = db.Column(db.DateTime, default=agora_utc)
    data_fim = db.Column(db.DateTime)


# bloco do historico
class Historico(db.Model):
    __tablename__ = "historico"

    id = db.Column(db.Integer, primary_key=True)

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"))
    reagente1_id = db.Column(db.Integer, db.ForeignKey("reagentes.id"))
    reagente2_id = db.Column(db.Integer, db.ForeignKey("reagentes.id"))
    resultado = db.Column(db.String(255))
    explicacao = db.Column(db.Text)

    simulacao_id = db.Column(db.Integer, db.ForeignKey("simulacao.id"), nullable=False)

    acao = db.Column(db.String(100))
    descricao = db.Column(db.Text)

    data = db.Column(db.DateTime, default=agora_utc)

    simulacao = db.relationship("Simulacao", backref="historicos")
