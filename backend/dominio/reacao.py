from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ReacaoDominio:
    nome: str
    tipo: str
    condicoes: dict[str, Any] = field(default_factory=dict)
    efeitos: dict[str, Any] = field(default_factory=dict)
