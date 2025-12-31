import asyncio
from app.sockets.server_websockets  import start_websocket_server

if __name__=='__main__':
    asyncio.run(start_websocket_server())
