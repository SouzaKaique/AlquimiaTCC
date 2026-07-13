from datetime import UTC, datetime


def agora_utc() -> datetime:
    """Retorna UTC sem timezone para compatibilidade com colunas DateTime existentes."""

    return datetime.now(UTC).replace(tzinfo=None)
