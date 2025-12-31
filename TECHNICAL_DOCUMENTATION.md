crear entorno virtual
 python -m venv env
activar entorno virtual
 env\Scripts\activate  
---

# Documentación Técnica del Servidor WebSocket para Juego de Preguntas

## Descripción General

El servidor WebSocket está desarrollado en Python utilizando la biblioteca `websockets`. Se conecta a una base de datos PostgreSQL para obtener preguntas de un quiz, permite la conexión de hasta 2 jugadores por partida y maneja la lógica de juego, incluidas las preguntas, respuestas, y puntajes.

### Arquitectura

- **Backend (Servidor WebSocket):** Python + `websockets`.
- **Base de Datos:** SQL SERVER.
- **Frontend:** React (se conecta al servidor WebSocket).

---

## Funciones Principales

### 1. **Servidor WebSocket**
   - **Archivo:** `main.py`
   - **Descripción:** Esta es la función principal que inicia el servidor WebSocket y gestiona las conexiones de los jugadores.

   ```python
   async def start_websocket_server():
       server = await websockets.serve(handle_connection, "localhost", 8765)
       print("Servidor WebSocket corriendo en ws://localhost:8765")
       print(f"La id del juego es {room_id}")
       await server.wait_closed()
   ```

   **Parámetros:**
   - `localhost`: Dirección IP del servidor.
   - `8765`: Puerto en el que se ejecuta el servidor WebSocket.

   **Funcionalidad:**
   - Inicializa el servidor y espera conexiones de jugadores.
   - Muestra el ID del juego (sala) en la consola.

---

### 2. **Conexión y Manejo de Jugadores**
   - **Archivo:** `main.py`
   - **Función:** `handle_connection(websocket)`
   - **Descripción:** Gestiona las conexiones de los jugadores, verifica sus IDs y controla el flujo del juego, como el inicio y la finalización de la partida.

   ```python
   async def handle_connection(websocket):
       name_player = await websocket.recv()
       id_player = await websocket.recv()
       ...
   ```

   **Flujo:**
   - Recibe el nombre del jugador y su ID.
   - Verifica que el ID sea correcto.
   - Rechaza la conexión si sobrepasa los jugadores conectados.
   - Inicia el juego cuando ambos jugadores están listos.

---

### 3. **Procesamiento de Respuestas**
   - **Archivo:** `main.py`
   - **Función:** `process_player_responses(player_responses, questions)`
   - **Descripción:** Procesa las respuestas enviadas por los jugadores y actualiza los puntajes.

   ```python
   def process_player_responses(player_responses, questions):
       response_results = []
       for player, selected_option in player_responses.items():
           ...
           is_correct = checkanswer(selected_option, correct_answer)
           response_results.append(...)
   ```

   **Parámetros:**
   - `player_responses`: Diccionario con las respuestas seleccionadas por cada jugador.
   - `questions`: Lista de preguntas del juego.

   **Funcionalidad:**
   - Comprueba si las respuestas de los jugadores son correctas.
   - Actualiza el puntaje del jugador si la respuesta es correcta.
   - Devuelve los resultados de las respuestas procesadas.

---

### 4. **Envío de Preguntas**
   - **Archivo:** `main.py`
   - **Función:** `send_question_to_all()`
   - **Descripción:** Envía la pregunta actual a todos los jugadores conectados.

   ```python
   async def send_question_to_all():
       current_question = questions[current_question_index]
       formatted_question = json.dumps(current_question)
       for client in connected_players:
           await client.send(message)
   ```

   **Funcionalidad:**
   - Toma la pregunta actual del quiz.
   - Envía la pregunta a todos los jugadores en formato JSON.

---

### 5. **Formato de Preguntas**
   - **Archivo:** `app/controller/formatquestion.py`
   - **Función:** `format_questions()`
   - **Descripción:** Obtiene las preguntas de la base de datos PostgreSQL y las formatea en JSON para ser utilizadas por el juego.

   ```python
   def format_questions():
       questions_from_db = question()
       formatted_questions = []
       for q in questions_from_db:
           formatted_question = {...}
           formatted_questions.append(formatted_question)
       return formatted_questions
   ```

   **Funcionalidad:**
   - Obtiene las preguntas de la base de datos.
   - Formatea las preguntas en un diccionario con la estructura necesaria para ser enviadas a los jugadores.

---

### 6. **Conexión a la Base de Datos**
   - **Archivo:** `app/db/connection.py`
   - **Función:** `connectionPostgres()`
   - **Descripción:** Establece una conexión con la base de datos PostgreSQL.

   ```python
   def connectionPostgres():
       connection = psycopg2.connect(...)
       return connection
   ```

   **Funcionalidad:**
   - Configura la conexión a la base de datos utilizando las credenciales provistas.
   - Devuelve la conexión activa.

---

### 7. **Consultas a la Base de Datos**
   - **Archivo:** `app/db/queries.py`
   - **Función:** `question()`
   - **Descripción:** Ejecuta la consulta SQL para obtener las preguntas del quiz desde la base de datos PostgreSQL.

   ```python
   def question():
       cur.execute(query)
       results = cur.fetchall()
       return results
   ```

   **Funcionalidad:**
   - Ejecuta la consulta SQL que recupera las preguntas del quiz.
   - Devuelve los resultados como una lista de tuplas que luego se formatearán.

---

### 8. **Generación de IDs Aleatorios**
   - **Archivo:** `app/controller/randomid.py`
   - **Función:** `randomId()`
   - **Descripción:** Genera un ID aleatorio para la sala de juego.

   ```python
   def randomId():
       return str(random.randint(1000, 9999))
   ```

   **Funcionalidad:**
   - Genera un número aleatorio de 4 dígitos para identificar la sala de juego.

---

## Flujo General del Juego

1. **Inicio del servidor WebSocket:** El servidor se inicia en `ws://localhost:8765`.
2. **Conexión de jugadores:** Los jugadores se conectan y envían su nombre y ID.
3. **Inicio del juego:** Una vez que ambos jugadores están conectados, el servidor envía la primera pregunta.
4. **Respuestas:** Los jugadores envían sus respuestas y el servidor las procesa.
5. **Actualización de puntajes:** Los puntajes se actualizan en función de las respuestas correctas.
6. **Envío de nuevas preguntas:** Si quedan más preguntas, se envían nuevas. De lo contrario, el juego finaliza.
7. **Desconexión:** Los jugadores se desconectan cuando el juego termina o si cierran su conexión.
---