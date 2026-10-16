from datetime import UTC, datetime


# data/hora utc sem fuso, no formato que as colunas DateTime do sqlite esperam
def agora_utc() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)
