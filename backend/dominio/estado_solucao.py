from dataclasses import dataclass, field
from typing import Any


@dataclass
class EstadoSolucao:
    """Estado quimico interno, separado da representacao visual."""

    cations: list[str] = field(default_factory=list)
    reagentes: list[str] = field(default_factory=list)
    ph: float = 7
    temperatura: float = 25
    cor: str = "incolor"
    precipitados: list[dict[str, Any]] = field(default_factory=list)
    gases: list[str] = field(default_factory=list)
    eventos: list[str] = field(default_factory=list)
    snapshots: list[dict[str, Any]] = field(default_factory=list)

    def __post_init__(self) -> None:
        if isinstance(self.cations, str):
            self.cations = [self.cations]

    @property
    def estado(self) -> dict[str, Any]:
        cation = self.cations[0] if self.cations else None
        dados = self.to_dict()
        dados["cation"] = cation
        dados["historico"] = self.eventos
        return dados

    def adicionar_reagente(self, reagente: str) -> None:
        self.reagentes.append(reagente)
        self.registrar_evento(f"Reagente {reagente} adicionado.")

    def adicionar_evento(self, mensagem: str) -> None:
        self.registrar_evento(mensagem)

    def registrar_evento(self, mensagem: str) -> None:
        self.eventos.insert(0, mensagem)

    def criar_snapshot(self) -> None:
        self.snapshots.append(self.to_dict())

    def alterar_ph(self, delta: float) -> None:
        self.ph = max(0, min(14, self.ph + delta))
        self.registrar_evento(f"pH alterado em {delta}.")

    def alterar_temperatura(self, delta: float) -> None:
        self.temperatura = max(0, self.temperatura + delta)
        self.registrar_evento(f"Temperatura alterada em {delta}C.")

    def adicionar_precipitado(self, nome: str, cor: str) -> None:
        self.precipitados.append({"nome": nome, "cor": cor})
        self.registrar_evento(f"Formacao de precipitado: {nome}.")

    def definir_precipitado(self, nome: str) -> None:
        self.precipitados.append({"nome": nome, "cor": "desconhecida"})
        self.registrar_evento(f"Formacao de precipitado: {nome}.")

    def liberar_gas(self, gas: str) -> None:
        self.gases.append(gas)
        self.registrar_evento(f"Liberacao de gas: {gas}.")

    def alterar_cor(self, cor: str) -> None:
        self.cor = cor
        self.registrar_evento(f"Solucao mudou para {cor}.")

    def to_dict(self) -> dict[str, Any]:
        return {
            "cations": self.cations,
            "reagentes": self.reagentes,
            "ph": self.ph,
            "temperatura": self.temperatura,
            "cor": self.cor,
            "precipitados": self.precipitados,
            "gases": self.gases,
            "eventos": self.eventos,
            "snapshots": self.snapshots,
        }
