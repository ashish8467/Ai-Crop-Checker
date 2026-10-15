import time
from threading import Lock
from typing import Any

_values: dict[str, tuple[float, Any]] = {}
_lock = Lock()


def cache_get(key: str) -> Any | None:
    now = time.monotonic()
    with _lock:
        item = _values.get(key)
        if item is None:
            return None
        expires_at, value = item
        if expires_at <= now:
            _values.pop(key, None)
            return None
        return value


def cache_set(key: str, value: Any, ttl_seconds: int) -> None:
    with _lock:
        _values[key] = (time.monotonic() + ttl_seconds, value)
