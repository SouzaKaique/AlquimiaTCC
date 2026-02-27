import json
from .estado import EstadoSolucao
from .regras import aplicar_regras

class MotorSimulacao:
    def __init__(self, estado_json):
        self.estado_dict = json.loads(estado_json)
        self.estado = EstadoSolucao(self.estado_dict["cation"])
        self.estado.estado = self.estado_dict

    def aplicar_reagente(self, reagente):
        aplicar_regras(self.estado, reagente)
        return json.dumps(self.estado.to_dict())