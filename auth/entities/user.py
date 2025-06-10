class User:
    id: str
    username: str
    name: str
    pwd_hash: str
    def __init__(self, id: str, username: str, name: str, pwd_hash: str):
        self.id = id
        self.username = username
        self.name = name
        self.pwd_hash = pwd_hash