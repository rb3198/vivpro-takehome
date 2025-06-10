class ErrorResponse:
    message: str
    status_code: int
    def __init__(self, status_code: int, message: str) -> None:
        self.status_code = status_code
        self.message = message