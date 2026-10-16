from datetime import UTC, datetime


# bloco de data e hora
def agora_utc() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)
