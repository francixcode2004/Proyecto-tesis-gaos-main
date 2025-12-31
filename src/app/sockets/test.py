import asyncio
import websockets
import json
import time
from app.db.queries import playersconfig
from app.controller.formatquestion import format_questions, checkanswer
from app.controller.randomid import randomId, checkId

class Player:
    def __init__(self, websocket, name, player_id):
        self.websocket = websocket
        self.name = name
        self.player_id = player_id
        self.score = 0
        self.response = None
        self.response_time = float('inf')

class QuizServer:
    def __init__(self):
        self.num_players = playersconfig()
        self.connected_players = {}  # {websocket: Player}
        self.questions = format_questions()
        self.room_id = randomId()
        self.current_question_index = 0
        self.question_start_time = None

    async def handle_connection(self, websocket):
        try:
            player_name = await websocket.recv()
            player_id = await websocket.recv()
            
            if not checkId(self.room_id, player_id):
                await websocket.send("Room Id incorrecta")
                return

            if len(self.connected_players) >= self.num_players:
                await websocket.send(f"Maximo numero de jugadores son {self.num_players}")
                await websocket.close()
                return
            
            player = Player(websocket, player_name, player_id)
            self.connected_players[websocket] = player
            
            if len(self.connected_players) < self.num_players:
                await websocket.send("Esperando a otros jugadores")
            
            if len(self.connected_players) == self.num_players:
                await self.notify_all("Jugadores completos")
                await self.send_question_to_all()
            
            await self.listen_for_responses(websocket)
        except websockets.exceptions.ConnectionClosedOK:
            self.remove_player(websocket)
        finally:
            self.remove_player(websocket)

    async def listen_for_responses(self, websocket):
        async for message in websocket:
            player = self.connected_players.get(websocket)
            if not player:
                continue
            try:
                message_data = json.loads(message)
                player_option = message_data.get("option_player")
                player.response_time = time.time() - self.question_start_time
                player.response = player_option
                print(f"{player.name} respondió en {player.response_time:.2f} segundos con opción {player_option}.")
                
                if all(p.response is not None for p in self.connected_players.values()):
                    await self.process_player_responses()
                    await self.send_next_question_or_finish()
                else:
                    await self.notify_all("Esperando respuesta del otro jugador")
            except json.JSONDecodeError:
                await websocket.send("Error en el formato de la respuesta.")

    async def process_player_responses(self):
        current_question = self.questions[self.current_question_index]
        correct_answer = current_question["answer"]
        
        for player in self.connected_players.values():
            is_correct = checkanswer(player.response, correct_answer)
            if is_correct:
                player.score += 100
            await player.websocket.send(json.dumps({
                "player": player.name,
                "is_correct": is_correct,
                "correct_answer": correct_answer,
                "current_score": player.score
            }))
            player.response = None  # Reset response for next question

    async def send_question_to_all(self):
        self.question_start_time = time.time()
        current_question = self.questions[self.current_question_index]
        for player in self.connected_players.values():
            await player.websocket.send(json.dumps(current_question))

    async def send_next_question_or_finish(self):
        self.current_question_index += 1
        
        if self.current_question_index < len(self.questions):
            await self.send_question_to_all()
        else:
            await self.notify_all("Juego finalizado")
            await asyncio.sleep(7)
            await self.send_top_players()
            self.reset_game()

    async def send_top_players(self):
        players_data = [
            {
                "name": player.name,
                "score": player.score,
                "time": player.response_time
            } for player in self.connected_players.values()
        ]
        players_data.sort(key=lambda x: (-x["score"], x["time"]))
        json_data = json.dumps(players_data)
        await self.notify_all(json_data)

    async def notify_all(self, message):
        for player in self.connected_players.values():
            try:
                await player.websocket.send(message)
            except websockets.exceptions.ConnectionClosed:
                self.remove_player(player.websocket)

    def remove_player(self, websocket):
        player = self.connected_players.pop(websocket, None)
        if player:
            print(f"Eliminando {player.name} de la lista de jugadores conectados")

    def reset_game(self):
        self.current_question_index = 0
        for player in self.connected_players.values():
            player.score = 0
            player.response = None

    async def start_server(self):
        server = await websockets.serve(self.handle_connection, "192.168.100.4", 8765)
        print("Servidor WebSocket corriendo en ws://192.168.100.4:8765")
        print(f"ID de la sala: {self.room_id}")
        print(f"Número de jugadores: {self.num_players}")
        await server.wait_closed()

if __name__ == "__main__":
    server = QuizServer()
    asyncio.run(server.start_server())
