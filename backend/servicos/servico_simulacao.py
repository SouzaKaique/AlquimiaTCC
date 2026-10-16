import json

from extensions import db
from models import Historico, Simulacao
from nucleo.tempo import agora_utc
from simulacao.motor import MotorSimulacao


# camada entre as rotas e o motor: carrega a simulacao do banco, aplica a regra e salva
class ServicoSimulacao:
    # desativa a simulacao anterior e grava um estado inicial novo
    def iniciar(self, usuario_id: int) -> dict:
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

        motor = MotorSimulacao(estado_json=simulacao.estado_json)
        return {"estado": motor.obter_estado_publico()}

    # reagente solto no tubo -> regra do grupo atual -> estado salvo + historico
    def aplicar_reagente(self, usuario_id: int, reagente: str) -> dict | None:
        simulacao = self.buscar_ativa(usuario_id)
        if not simulacao:
            return None

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

    # aquecer, agitar, centrifugar... mesmo fluxo do reagente
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

    # modo apresentacao: substitui o estado pela marcha ja posicionada na etapa escolhida
    def ir_para_etapa(self, usuario_id: int, etapa: int) -> dict:
        simulacao = self.buscar_ativa(usuario_id)
        if not simulacao:
            self.iniciar(usuario_id)
            simulacao = self.buscar_ativa(usuario_id)

        motor = MotorSimulacao()
        simulacao.estado_json = motor.ir_para_etapa(etapa)
        self.registrar_historico(
            usuario_id=usuario_id,
            simulacao_id=simulacao.id,
            acao="apresentacao",
            descricao=f"Modo apresentacao: navegou para a etapa {etapa}.",
        )
        db.session.commit()

        return {"mensagem": "Etapa carregada.", "estado": motor.obter_estado_publico()}

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

    # cada passo do aluno vira uma linha na tabela historico
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
