from app import app
from extensions import db
from models import Reagente, Reacao
import json


def seed():
    with app.app_context():

        print("Iniciando seed...")

        # RESET COMPLETO DO BANCO
        print("Resetando banco de dados...")
        db.drop_all()
        db.create_all()
        print("Banco resetado com sucesso.")
        
        # REAGENTE

        reagentes = [
            Reagente(nome="Ácido Clorídrico", formula="HCl"),
            Reagente(nome="Hidróxido de Sódio", formula="NaOH"),
            Reagente(nome="Ácido Sulfúrico", formula="H2SO4"),
            Reagente(nome="Carbonato de Sódio", formula="Na2CO3"),
            Reagente(nome="Nitrato de Prata", formula="AgNO3"),
            Reagente(nome="Cloreto de Sódio", formula="NaCl"),
            Reagente(nome="Cobre", formula="Cu"),
            Reagente(nome="Sulfato de Cobre", formula="CuSO4"),
        ]

        db.session.add_all(reagentes)
        db.session.commit()

        print("Reagentes criados.")

        # Criando dicionário para acessar pelos nomes
        r = {reagente.nome: reagente for reagente in Reagente.query.all()}
        # REAÇÕES (AGORA COM EFEITOS ESTRUTURADOS

        reacoes = [

            # Neutralização
            Reacao(
                reagente1_id=r["Ácido Clorídrico"].id,
                reagente2_id=r["Hidróxido de Sódio"].id,
                tipo="neutralizacao",
                efeitos_json=json.dumps({
                    "delta_ph": 3,
                    "delta_temp": 5,
                    "gera_precipitado": False,
                    "gera_gas": False,
                    "muda_cor": "incolor"
                })
            ),

            # Liberação de gás
            Reacao(
                reagente1_id=r["Ácido Clorídrico"].id,
                reagente2_id=r["Carbonato de Sódio"].id,
                tipo="liberacao_gas",
                efeitos_json=json.dumps({
                    "delta_ph": -1,
                    "gera_precipitado": False,
                    "gera_gas": True,
                    "gas": "CO2",
                    "muda_cor": None
                })
            ),

            # Precipitação
            Reacao(
                reagente1_id=r["Nitrato de Prata"].id,
                reagente2_id=r["Cloreto de Sódio"].id,
                tipo="precipitacao",
                efeitos_json=json.dumps({
                    "gera_precipitado": True,
                    "cor_precipitado": "branco",
                    "gera_gas": False,
                    "muda_cor": None
                })
            ),

            # Oxidação simples
            Reacao(
                reagente1_id=r["Cobre"].id,
                reagente2_id=r["Ácido Sulfúrico"].id,
                tipo="oxidacao",
                efeitos_json=json.dumps({
                    "delta_ph": -2,
                    "gera_precipitado": False,
                    "gera_gas": True,
                    "gas": "H2",
                    "muda_cor": "azul"
                })
            ),
        ]

        db.session.add_all(reacoes)
        db.session.commit()

        print("Reações criadas.")
        print("Seed finalizado com sucesso!")


if __name__ == "__main__":
    seed()