class PipelineQuimico:
    def __init__(self) -> None:
        self._etapas = []

    def adicionar_etapa(self, etapa):
        self._etapas.append(etapa)
        return self

    def executar(self, estado: dict, comando: dict) -> dict:
        for etapa in self._etapas:
            estado = etapa(estado, comando)
        return estado
