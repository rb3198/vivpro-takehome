from typing import TypedDict

class Session(TypedDict):
    id: str
    user_id: str
    expires_at: float