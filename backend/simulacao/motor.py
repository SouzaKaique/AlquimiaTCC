import json

from simulacoes.marcha_analitica import MarchaAnalitica


# converte o estado salvo (texto json no banco) para dict e repassa para a marcha
class MotorSimulacao:
    def __init__(self, estado_json=None):
        estado = json.loads(estado_json) if estado_json else None
        self.marcha = MarchaAnalitica(estado=estado)

    def aplicar_reagente(self, reagente):
        self.marcha.aplicar_reagente(reagente)
        return json.dumps(self.marcha.obter_estado())

    def executar_acao(self, acao):
        self.marcha.executar_acao(acao)
        return json.dumps(self.marcha.obter_estado())

    def ir_para_etapa(self, etapa):
        self.marcha.ir_para_etapa(etapa)
        return json.dumps(self.marcha.obter_estado())

    def obter_estado(self):
        return self.marcha.obter_estado()

    def obter_estado_publico(self):
        return self.marcha.obter_estado_publico()
