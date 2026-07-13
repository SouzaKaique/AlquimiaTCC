import json

from extensions import db
from models import Historico, Simulacao
from nucleo.tempo import agora_utc
from simulacao.motor import MotorSimulacao


class ServicoSimulacao:
    def iniciar(self, usuario_id: int) -> dict:
        # cada usuário mantém apenas uma simulação ativa por vez
        Simulacao.query.filter_by(usuario_id=usuario_id, ativa=True).update({"ativa": False})

        motor = MotorSimulacao()
        simulacao = Simulacao(
            usuario_id=usuario_id,
            cation_secreto="marcha-por-grupos",
            estado_json=json.dumps(motor.obter_estado()),
            ativa=True,
        )

        db.session.add(simulacao)
        db.session.commit()

        return {
            "mensagem": "Simulacao iniciada com sucesso.",
            "estado": motor.obter_estado_publico(),
        }

    def obter_estado(self, usuario_id: int) -> dict | None:
        simulacao = self.buscar_ativa(usuario_id)
        if not simulacao:
            return None

        # o motor recebe o estado salvo, aplica a regra química e devolve o novo estado serializado
        motor = MotorSimulacao(estado_json=simulacao.estado_json)
        return {"estado": motor.obter_estado_publico()}

    def aplicar_reagente(self, usuario_id: int, reagente: str) -> dict | None:
        simulacao = self.buscar_ativa(usuario_id)
        if not simulacao:
            return None

        # ações como agitar, centrifugar e aquecer passam pelo mesmo motor da marcha
        motor = MotorSimulacao(estado_json=simulacao.estado_json)
        simulacao.estado_json = motor.aplicar_reagente(reagente)
        self.registrar_historico(
            usuario_id=usuario_id,
            simulacao_id=simulacao.id,
            acao="reagente",
            descricao=f"Reagente aplicado: {reagente}.",
        )
        db.session.commit()

        return {
            "mensagem": "Reagente aplicado com sucesso.",
            "estado": motor.obter_estado_publico(),
        }

    def executar_acao(self, usuario_id: int, acao: str, descricao_historico: str) -> dict | None:
        simulacao = self.buscar_ativa(usuario_id)
        if not simulacao:
            return None

        motor = MotorSimulacao(estado_json=simulacao.estado_json)
        simulacao.estado_json = motor.executar_acao(acao)
        self.registrar_historico(
            usuario_id=usuario_id,
            simulacao_id=simulacao.id,
            acao="acao",
            descricao=descricao_historico,
        )
        db.session.commit()

        return {"mensagem": "Acao registrada.", "estado": motor.obter_estado_publico()}

    def finalizar(self, usuario_id: int) -> bool:
        simulacao = self.buscar_ativa(usuario_id)
        if not simulacao:
            return False

        simulacao.ativa = False
        simulacao.data_fim = agora_utc()
        db.session.commit()
        return True

    def buscar_ativa(self, usuario_id: int):
        return (
            Simulacao.query.filter_by(usuario_id=usuario_id, ativa=True)
            .order_by(Simulacao.id.desc())
            .first()
        )

    def registrar_historico(self, usuario_id: int, simulacao_id: int, acao: str, descricao: str) -> None:
        db.session.add(
            Historico(
                usuario_id=usuario_id,
                simulacao_id=simulacao_id,
                reagente1_id=0,
                reagente2_id=0,
                resultado=acao,
                explicacao=descricao,
                acao=acao,
                descricao=descricao,
                data=agora_utc(),
            )
        )
