class EstadoSolucao:
    def __init__(self, cation):
        self.estado = {
            "cation": cation,
            "ph": 7,
            "temperatura": 25,
            "precipitado": None,
            "cor_solucao": "incolor",
            "historico": []
        }

    def adicionar_evento(self, evento):
        self.estado["historico"].append(evento)

    def definir_precipitado(self, nome):
        self.estado["precipitado"] = nome

    def alterar_cor(self, cor):
        self.estado["cor_solucao"] = cor

    def to_dict(self):
        return self.estado