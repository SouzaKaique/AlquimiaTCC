from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from nucleo.tempo import agora_utc


@dataclass(frozen=True)
class EventoQuimico:
    tipo: str
    mensagem: str
    dados: dict[str, Any] | None = None
    criado_em: datetime = field(default_factory=agora_utc)


class BarramentoEventos:
    def __init__(self) -> None:
        self._eventos: list[EventoQuimico] = []

    def publicar(self, evento: EventoQuimico) -> None:
        self._eventos.append(evento)

    def listar(self) -> list[EventoQuimico]:
        return list(self._eventos)
