from contextlib import asynccontextmanager
import os
from sqlite3 import Connection, connect
from queue import Empty
from asyncio import Queue
DB_PATH = "./db/main.db"

class ConnectionPool:
    def __init__(self, max_connections=5) -> None:
        self.max_connections = max_connections
        if not os.path.exists(DB_PATH):
            print("Could not find the Database. Creating the DB from scratch using the provided file.")
            self.create_db()  
        self.pool: Queue[Connection] = self.populate_pool()
    
    def create_db(self):
        with open(DB_PATH, "x") as f:
            f.close()
    
    def populate_pool(self):
        pool = Queue(maxsize=self.max_connections)
        for _ in range(self.max_connections):
            conn = connect(DB_PATH)
            pool.put_nowait(conn)
        return pool
    
    async def get_connection(self):
        return await self.pool.get()
    
    async def release(self, conn: Connection):
        await self.pool.put(conn)

    @asynccontextmanager
    async def connection(self):
        conn = await self.get_connection()
        try:
            yield conn
        finally:
            await self.release(conn)

connection_pool = ConnectionPool()
