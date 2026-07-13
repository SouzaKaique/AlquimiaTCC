from dataclasses import dataclass


@dataclass(frozen=True)
class ReagenteDominio:
    nome: str
    sigla: str
    descricao: str
    tipo: str
    etapas: tuple[int, ...]
