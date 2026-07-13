from dataclasses import dataclass


@dataclass(frozen=True)
class Cation:
    simbolo: str
    grupo: int
    descricao: str = ""
