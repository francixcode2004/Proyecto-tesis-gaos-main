
---

# 🎮 Quien Quiere Ser Ingeniero - Servidor WebSocket para Juego de Preguntas

Un servidor WebSocket robusto diseñado para un juego de preguntas en tiempo real estilo "Quien Quiere Ser Millonario". El backend está desarrollado en Python con la librería `websockets` para comunicación bidireccional con clientes. Obtiene preguntas de una base de datos SQL SERVER y gestiona respuestas y puntajes de jugadores en tiempo real.

El frontend está construido con React, Vite y Tailwind CSS, proporcionando una interfaz moderna e interactiva para los jugadores.

**Para más detalles técnicos, revisa la [Documentación Técnica](TECHNICAL_DOCUMENTATION.md).**

---

## 📋 Información de Autores

- **Francisco López** - flopeze@est.ups.edu.ec
- **Juan Donoso** - jdonosoo@est.ups.edu.ec

## 📁 Estructura del Proyecto

```plaintext
Quien_Quiere_Ser_Ingeniero/
├── src/                           # Código del Backend Python
│   ├── main.py                    # Punto de entrada principal
│   ├── __init__.py
│   └── app/
│       ├── __init__.py
│       ├── controller/
│       │   ├── __init__.py
│       │   ├── formatquestion.py  # Formato y validación de preguntas
│       │   └── randomid.py        # Generación y validación de IDs de sala
│       ├── db/
│       │   ├── __init__.py
│       │   ├── connection.py      # Conexión a SQL SERVER
│       │   └── queries.py         # Consultas y obtención de datos
│       └── sockets/
│           ├── __init__.py
│           └── server_websockets.py  # Servidor WebSocket principal
│
├── frontend/                      # Código del Frontend React
│   ├── src/
│   │   ├── main.jsx              # Punto de entrada React
│   │   ├── App.jsx               # Componente principal de enrutamiento
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Página de login y conexión
│   │   │   ├── QuizPage.jsx      # Página principal del quiz
│   │   │   └── Ranking.jsx       # Página de ranking final
│   │   ├── components/
│   │   │   ├── WebSocketContext.jsx    # Context para gestionar WebSocket
│   │   │   ├── OptionButton.jsx        # Botón de opciones
│   │   │   ├── QuestionLabel.jsx       # Etiqueta de pregunta
│   │   │   ├── InputField.jsx          # Campo de entrada
│   │   │   ├── SubmitButton.jsx        # Botón de envío
│   │   │   ├── CardRanking.jsx         # Tarjeta de ranking
│   │   │   ├── RankingBarChart.jsx     # Gráfico de ranking
│   │   │   ├── ErrorBoundary.jsx       # Manejo de errores
│   │   │   └── Logo.jsx                # Logo de la aplicación
│   │   ├── hooks/
│   │   │   └── useWebSocket.js   # Hook personalizado para WebSocket
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
├── env/                           # Entorno virtual Python
├── README.md                      # Este archivo
├── TECHNICAL_DOCUMENTATION.md     # Documentación técnica detallada
└── .env                          # Variables de entorno (no incluido en repositorio)
```

---

## 🔄 Flujo Completo de la Aplicación

### **Flujo General del Juego**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO GENERAL DEL JUEGO                  │
└─────────────────────────────────────────────────────────────┘

1. INICIO
   ↓
2. JUGADORES SE CONECTAN AL SERVIDOR
   ├── Ingresan nombre
   ├── Ingresan ID de sala
   └── Establecen conexión WebSocket
   ↓
3. ESPERA DE JUGADORES
   ├── Mensaje: "Esperando a otro jugador..."
   └── Cuando llegan N jugadores → Iniciar partida
   ↓
4. JUEGO EN CURSO
   ├── Servidor envía pregunta a todos
   ├── Jugadores responden
   ├── Servidor evalúa respuestas
   ├── Actualiza puntajes
   └── Repite para cada pregunta
   ↓
5. FINALIZACIÓN
   ├── Se acabaron las preguntas
   ├── Servidor calcula rankings
   └── Envía resultados a clientes
   ↓
6. VISUALIZACIÓN DE RANKING
   ├── Jugadores ven el ranking final
   └── Animación de puntajes
   ↓
7. FIN
```

### **Flujo Backend (Python WebSocket)**

```
BACKEND FLOW
═══════════════════════════════════════════════════════════════

main.py
  ↓
  └─→ start_websocket_server()
      │
      ├─→ websockets.serve(handle_connection, HOST, PORT)
      │
      └─→ handle_connection(websocket) [Para cada cliente]
          │
          ├─→ Recibir nombre y ID del jugador
          │   └─→ checkId(room_id, player_id)
          │
          ├─→ Verificar número máximo de jugadores
          │
          ├─→ Agregar a connected_players {}
          │
          ├─→ Cuando hay N jugadores completos
          │   └─→ send_question_to_all()
          │       ├─→ format_questions() [De DB]
          │       │   ├─→ questionsconfig() [Lee config]
          │       │   ├─→ question(num, materia, nivel) [Lee preguntas]
          │       │   └─→ Retorna preguntas formateadas JSON
          │       └─→ Envía pregunta a todos los clientes
          │
          ├─→ Escuchar respuestas (async for message)
          │   ├─→ Guardar respuesta en player_responses
          │   ├─→ Registrar tiempo de respuesta
          │   │
          │   └─→ Cuando todos respondieron
          │       ├─→ process_player_responses()
          │       │   ├─→ checkanswer(selected, correct)
          │       │   ├─→ Actualizar puntajes (+100 si correcto)
          │       │   └─→ Retorna resultados
          │       │
          │       ├─→ Enviar feedback a jugadores
          │       │   ├─→ "¡Respuesta correcta!" o "Incorrecta"
          │       │   └─→ Mostrar respuesta correcta
          │       │
          │       └─→ send_next_question_or_finish()
          │           ├─→ Si hay más preguntas
          │           │   └─→ Repetir desde send_question_to_all()
          │           │
          │           └─→ Si no hay más preguntas
          │               ├─→ Enviar "Juego finalizado"
          │               └─→ top_players()
          │                   ├─→ Ordenar jugadores por puntaje
          │                   ├─→ Convertir a JSON
          │                   └─→ Enviar ranking a todos

        Connection.onclose
          └─→ Limpiar jugador de connected_players

═══════════════════════════════════════════════════════════════
```

### **Flujo Frontend (React)**

```
FRONTEND FLOW
═══════════════════════════════════════════════════════════════

App.jsx (Router Principal)
  ├─→ Route "/" → LoginPage
  ├─→ Route "/quiz" → QuizPage
  └─→ Route "/ranking" → RankingPage

LOGIN PAGE FLOW:
────────────────
LoginPage.jsx
  ├─→ Renderizar formulario (nombre, ID)
  │
  ├─→ handleSubmit()
  │   ├─→ new WebSocket("ws://192.168.100.7:8765")
  │   ├─→ socket.send(name) [Envía nombre]
  │   ├─→ socket.send(id) [Envía ID]
  │   │
  │   └─→ socket.onmessage
  │       ├─→ Si: "Esperando a otro jugador"
  │       │   └─→ Mostrar tarjeta de espera
  │       │
  │       ├─→ Si: "Jugadores completos"
  │       │   └─→ navigate("/quiz")
  │       │
  │       └─→ Si: "Room Id incorrecta"
  │           └─→ Mostrar error

QUIZ PAGE FLOW:
───────────────
QuizPage.jsx
  ├─→ useEffect (Configuración)
  │   ├─→ Cargar audio de tensión
  │   └─→ Esperar primera interacción del usuario
  │
  ├─→ useEffect (Escuchar WebSocket)
  │   └─→ socket.onmessage
  │       ├─→ Si: "Enviando pregunta:"
  │       │   ├─→ Parse JSON de pregunta
  │       │   ├─→ Guardar en localStorage
  │       │   ├─→ setCurrentQuestion()
  │       │   └─→ Habilitar opciones
  │       │
  │       ├─→ Si: "Esperando respuesta del otro jugador"
  │       │   └─→ Deshabilitar opciones
  │       │
  │       └─→ Si: "Juego finalizado"
  │           ├─→ setGameEnded(true)
  │           └─→ setTimeout(() → navigate("/ranking"), 5000)
  │
  ├─→ Renderizar pregunta y opciones
  │
  └─→ handleOptionClick(option)
      ├─→ socket.send(JSON.stringify({option_player: option}))
      └─→ Deshabilitar opciones hasta respuesta

RANKING PAGE FLOW:
──────────────────
RankingPage.jsx
  └─→ useEffect (Escuchar datos de ranking)
      └─→ socket.onmessage
          ├─→ Parse datos del ranking (nombre, puntaje, tiempo)
          ├─→ setData() con datos formateados
          │
          └─→ Iniciar animación de puntajes
              ├─→ Duration: 5 segundos
              ├─→ Steps: 60 iteraciones
              └─→ Renderizar RankingBarChart con animación

═══════════════════════════════════════════════════════════════
```

---

## 📦 Dependencias del Proyecto

### Backend (Python)

**Dependencias Principales:**
```
websockets==13.1     # Comunicación WebSocket bidireccional
pyodbc==5.2.0       # Conexión a SQL Server
python-dotenv==1.0.1 # Cargar variables de entorno desde .env
```

**Instalación:**
```bash
pip install websockets==13.1 pyodbc==5.2.0 python-dotenv==1.0.1
```

**Lista Completa de Paquetes Instalados:**
```plaintext
Package          Version
─────────────────────────────
blinker          1.8.2
click            8.1.7
colorama         0.4.6
Flask            3.0.3
itsdangerous     2.2.0
Jinja2           3.1.4
MarkupSafe       3.0.1
pip              24.2
psycopg2         2.9.9
psycopg2-binary  2.9.9
psycopg2-pool    1.2
pyodbc           5.2.0
python-dotenv    1.0.1
websockets       13.1
Werkzeug         3.0.4
```

### Frontend (Node.js)

**Dependencias principales:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0",
    "recharts": "^2.13.3"
  },
  "devDependencies": {
    "vite": "^5.4.8",
    "tailwindcss": "^3.4.13",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
```

**Instalación:**
```bash
cd frontend
npm install
```

---

## 🛠️ Configuración e Instalación

### Requisitos Previos
- Python 3.8+
- Node.js 16+
- SQL Server con ODBC Driver 17
- pip y npm actualizados

### Backend Setup

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd Quien_Quiere_Ser_Ingeniero-main

# 2. Crear entorno virtual
python -m venv env

# 3. Activar entorno virtual
# En Windows:
env\Scripts\activate
# En macOS/Linux:
source env/bin/activate

# 4. Instalar dependencias
pip install websockets==13.1 pyodbc==5.2.0 python-dotenv==1.0.1

# 5. Configurar variables de entorno
# Crear archivo .env en la raíz del proyecto
echo HOST=192.168.100.7 > .env
echo USER=tu_usuario >> .env
echo PASSWORD=tu_contraseña >> .env
echo DATABASE=tu_base_datos >> .env

# 6. Ejecutar servidor
python src/main.py
```

### Frontend Setup

```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 🎯 Funciones Principales Documentadas

### **Backend - Módulo Principal**

#### `src/main.py`

**`async def start_websocket_server()`**
- **Propósito:** Iniciar el servidor WebSocket
- **Parámetros:** Ninguno (usa configuración global)
- **Retorna:** Corre indefinidamente
- **Utilización:** Punto de entrada principal de la aplicación
- **Código:**
  ```python
  async def start_websocket_server():
      room_id = randomId()
      config = questionsconfig()
      server = await websockets.serve(handle_connection, "0.0.0.0", 8765)
      print(f"Servidor corriendo en ws://0.0.0.0:8765")
      print(f"La id del juego es {room_id}")
      await server.wait_closed()
  ```

#### `src/app/sockets/server_websockets.py`

**`async def handle_connection(websocket)`**
- **Propósito:** Manejar cada conexión de cliente WebSocket
- **Parámetros:** 
  - `websocket` - Conexión WebSocket del cliente
- **Retorna:** Void (mantiene conexión abierta)
- **Utilización:** Se ejecuta para cada cliente conectado
- **Lógica:**
  1. Recibe nombre del jugador
  2. Recibe ID de sala
  3. Valida ID con `checkId()`
  4. Agrega a `connected_players`
  5. Espera a que se conecten N jugadores
  6. Inicia partida
  7. Escucha respuestas del jugador
  8. Procesa respuestas
  9. Envía feedback
  10. Maneja desconexión

**`async def send_question_to_all()`**
- **Propósito:** Enviar pregunta actual a todos los jugadores
- **Parámetros:** Ninguno (usa `questions` y `current_question_index` globales)
- **Retorna:** Void
- **Utilización:** Llamada cuando hay N jugadores conectados
- **Proceso:**
  1. Obtiene pregunta actual del índice
  2. Formatea como JSON
  3. Envía a todos los clientes conectados

**`def process_player_responses(player_responses, questions)`**
- **Propósito:** Procesar respuestas y actualizar puntajes
- **Parámetros:**
  - `player_responses` - Dict con respuestas de jugadores
  - `questions` - Lista de preguntas del juego
- **Retorna:** Lista de resultados procesados
- **Utilización:** Cuando todos los jugadores responden
- **Lógica:**
  ```python
  for player, option in player_responses.items():
      correct_answer = questions[current_q]["answer"]
      is_correct = checkanswer(option, correct_answer)
      if is_correct:
          player_scores[player] += 100
  ```

**`async def top_players()`**
- **Propósito:** Generar ranking final ordenado
- **Parámetros:** Ninguno
- **Retorna:** String JSON con ranking ordenado
- **Utilización:** Llamada al finalizar el juego
- **Formato retornado:**
  ```json
  [
    {"name": "Jugador1", "score": 300, "time": 2.5},
    {"name": "Jugador2", "score": 200, "time": 3.1}
  ]
  ```

### **Backend - Módulo de Base de Datos**

#### `src/app/db/connection.py`

**`def connect_db()`**
- **Propósito:** Conectar a la base de datos SQL Server
- **Parámetros:** Ninguno (lee variables de entorno)
- **Retorna:** Conexión pyodbc o excepción
- **Utilización:** Usado por todas las funciones de base de datos
- **Variables de entorno requeridas:**
  - `HOST` - IP/nombre del servidor SQL
  - `USER` - Usuario de SQL Server
  - `PASSWORD` - Contraseña
  - `DATABASE` - Nombre de la base de datos

#### `src/app/db/queries.py`

**`def questionsconfig()`**
- **Propósito:** Obtener configuración del juego
- **Parámetros:** Ninguno
- **Retorna:** Tupla `(num_preguntas, materia, nivel)`
- **Utilización:** Llamada al iniciar formato de preguntas
- **Query SQL:**
  ```sql
  SELECT NumeroPreguntas, Materia, NivelPregunta FROM config_qqi
  ```

**`def question(num_preguntas, materia, dificultad)`**
- **Propósito:** Obtener preguntas de la base de datos
- **Parámetros:**
  - `num_preguntas` - Número de preguntas a obtener
  - `materia` - Asignatura/materia (ej: "Programacion")
  - `dificultad` - Nivel de dificultad (1-5)
- **Retorna:** Lista de tuplas con preguntas
- **Utilización:** Llamada en `format_questions()`
- **Query SQL:**
  ```sql
  SELECT TOP ? * FROM preguntas WHERE materia=? AND dificultad=?
  ```

**`def playersconfig()`**
- **Propósito:** Obtener número máximo de jugadores permitidos
- **Parámetros:** Ninguno
- **Retorna:** Número entero de jugadores
- **Utilización:** Controla el límite de conexiones simultáneas

### **Backend - Módulo Controller**

#### `src/app/controller/formatquestion.py`

**`def format_questions()`**
- **Propósito:** Convertir preguntas de base de datos a formato JSON
- **Parámetros:** Ninguno (usa funciones de queries.py)
- **Retorna:** Lista de diccionarios formateados
- **Estructura de retorno:**
  ```python
  [
    {
      "id": 1,
      "question": "¿Cuál es la salida de print(2+2)?",
      "option1": "4",
      "option2": "22",
      "option3": "Error",
      "option4": "Nada",
      "answer": "1942"  # ID del código correcto
    },
    ...
  ]
  ```
- **Utilización:** Llamada al inicio del juego

**`def checkanswer(selected_option, correct_answer)`**
- **Propósito:** Verificar si la respuesta es correcta
- **Parámetros:**
  - `selected_option` - Opción seleccionada por jugador (ej: "1942")
  - `correct_answer` - Respuesta correcta de la BD
- **Retorna:** Boolean (True si coincide, False si no)
- **Utilización:** En `process_player_responses()`

#### `src/app/controller/randomid.py`

**`def randomId()`**
- **Propósito:** Generar ID aleatorio de sala
- **Parámetros:** Ninguno
- **Retorna:** String con número entre 1000-9999
- **Utilización:** Crear ID única para cada partida
- **Ejemplo:** `"5847"`

**`def checkId(create_id, player_id)`**
- **Propósito:** Validar que el ID de sala sea correcto
- **Parámetros:**
  - `create_id` - ID de sala generada por servidor
  - `player_id` - ID ingresado por jugador
- **Retorna:** Boolean (True si coinciden)
- **Utilización:** En `handle_connection()` para validar jugadores

### **Frontend - Páginas**

#### `frontend/src/App.jsx`
- **Propósito:** Componente raíz con enrutamiento
- **Props:** Ninguno
- **Estado:**
  - `socketConnection` - Conexión WebSocket activa
- **Rutas:**
  - `/` → LoginPage
  - `/quiz` → QuizPage  
  - `/ranking` → RankingPage

#### `frontend/src/pages/LoginPage.jsx`
- **Propósito:** Página de login y conexión WebSocket
- **Props:** `setSocketConnection` - Función para guardar conexión
- **Funciones principales:**
  - `handleSubmit()` - Conecta al servidor WebSocket
  - Valida nombre e ID no vacíos
  - Envía nombre y ID al servidor

#### `frontend/src/pages/QuizPage.jsx`
- **Propósito:** Página principal del quiz
- **Props:** `socketConnection` - Conexión WebSocket
- **Estado:**
  - `currentQuestion` - Pregunta actual
  - `gameEnded` - Flag si juego terminó
  - `optionsDisabled` - Deshabilitar opciones
- **Funciones:**
  - `handleOptionClick(option)` - Envía respuesta seleccionada
  - Escucha mensajes del servidor con `useEffect`

#### `frontend/src/pages/RankingPage.jsx`
- **Propósito:** Página de ranking final
- **Props:** `socketConnection` - Conexión WebSocket
- **Funcionalidad:**
  - Recibe ranking del servidor
  - Anima puntajes durante 5 segundos
  - Utiliza `RankingBarChart` para visualizar datos

### **Frontend - Hooks Personalizados**

#### `frontend/src/hooks/useWebSocket.js`
- **Propósito:** Hook personalizado para manejar WebSocket
- **Retorna:** `{ ws, serverMessage, sendMessage }`
- **Utilización:** Facilita conexión en componentes
- **Ejemplo:**
  ```javascript
  const { ws, serverMessage, sendMessage } = useWebSocket();
  sendMessage(JSON.stringify({option_player: "1942"}));
  ```

#### `frontend/src/components/WebSocketContext.jsx`
- **Propósito:** Context API para compartir WebSocket
- **Proveedor:** `WebSocketProvider`
- **Hook:** `useWebSocket()` - Acceder a contexto
- **Utilización:** Envolver App con `<WebSocketProvider>`

---

## 🔌 Protocolo de Comunicación WebSocket

### Mensajes Cliente → Servidor

**1. Conexión inicial:**
```javascript
// Primero envía nombre
socket.send(nombreJugador);  // String puro

// Luego envía ID de sala
socket.send(idSala);  // String puro
```

**2. Respuesta a pregunta:**
```javascript
socket.send(JSON.stringify({
  option_player: "1942"  // ID de la opción seleccionada
}));
```

### Mensajes Servidor → Cliente

**1. Estados de conexión:**
```
"Esperando a otro jugador..."
"Jugadores completos"
"Room Id incorrecta"
"Máximo número de jugadores son N"
```

**2. Pregunta:**
```
"Enviando pregunta: {JSON con estructura de pregunta}"
```

**3. Feedback de respuesta:**
```
"{NombreJugador}, ¡Respuesta correcta! Tu puntaje es 100"
"{NombreJugador}, respuesta incorrecta. Correcta: opción X"
```

**4. Finalización:**
```
"Esperando respuesta del otro jugador"
"Juego finalizado"
```

**5. Ranking (JSON):**
```json
[
  {"name": "Jugador1", "score": 300, "time": 2.5},
  {"name": "Jugador2", "score": 200, "time": 3.1}
]
```

---

## 📋 Estructura de Base de Datos SQL

### Tabla: `preguntas`
```sql
CREATE TABLE preguntas (
    idPregunta INT PRIMARY KEY IDENTITY(1,1),
    question NVARCHAR(MAX) NOT NULL,
    option1 NVARCHAR(255) NOT NULL,
    option2 NVARCHAR(255) NOT NULL,
    option3 NVARCHAR(255) NOT NULL,
    option4 NVARCHAR(255) NOT NULL,
    answer NVARCHAR(255) NOT NULL,  -- Ej: "1942" (ID de opción correcta)
    materia NVARCHAR(100),
    dificultad INT  -- 1-5
);
```

### Tabla: `config_qqi`
```sql
CREATE TABLE config_qqi (
    Jugadores INT,
    NumeroPreguntas INT,
    Materia NVARCHAR(100),
    NivelPregunta INT
);
```

---

## 📝 Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto:

```bash
HOST=192.168.100.7           # IP del servidor SQL Server
USER=sa                       # Usuario de SQL Server
PASSWORD=TuContraseña123     # Contraseña de SQL Server
DATABASE=nombre_base_datos    # Nombre de la base de datos
```

---

## 🚀 Cómo Ejecutar el Proyecto

### Terminal 1: Iniciar Backend

```bash
cd Quien_Quiere_Ser_Ingeniero-main
env\Scripts\activate
python src/main.py
```

**Salida esperada:**
```
Conexión exitosa a la base de datos
Servidor WebSocket corriendo en ws://0.0.0.0:8765
La id del juego es 7382
```

### Terminal 2: Iniciar Frontend

```bash
cd Quien_Quiere_Ser_Ingeniero-main/frontend
npm run dev
```

**Salida esperada:**
```
  VITE v5.4.8  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Abrir en navegadores

1. Navegador 1: http://localhost:5173/ (Jugador 1)
2. Navegador 2: http://localhost:5173/ (Jugador 2)
3. Ambos ingresan el ID mostrado en terminal (ej: 7382)
4. ¡A jugar!

---

## 🐛 Manejo de Errores y Debugging

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Room Id incorrecta` | ID no coincide | Verificar ID mostrado en terminal |
| `Conexión rechazada` | Servidor no está corriendo | Ejecutar `python src/main.py` |
| `máximo número de jugadores` | Ya hay 2 conectados | Esperar o cambiar config en BD |
| `Error de base de datos` | Variables .env incorrectas | Verificar HOST, USER, PASSWORD, DATABASE |
| `WebSocket error` | Firewall bloquea puerto 8765 | Permitir puerto 8765 en firewall |

### Debugging

- **Backend:** Revisar logs en consola de Python
- **Frontend:** Abrir DevTools (F12) → Console
- **WebSocket:** Usar extensión "WebSocket Test Client" en Chrome

---

## 📊 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA GENERAL                    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐
│   CLIENTE 1      │       │   CLIENTE 2      │
│  (React App)     │       │  (React App)     │
│   Browser        │       │   Browser        │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         │    WebSocket Protocol    │
         │    (ws://IP:8765)        │
         │◄──────────────────────────►
         │                          │
    ┌────▼───────────────────────────┴─────┐
    │                                       │
    │    SERVIDOR WEBSOCKET (Python)       │
    │    ┌────────────────────────────┐    │
    │    │  handle_connection()       │    │
    │    │  - Gestión de jugadores   │    │
    │    │  - Lógica del juego       │    │
    │    │  - Envío de preguntas     │    │
    │    │  - Procesamiento respuestas│   │
    │    └────────────────────────────┘    │
    │                                       │
    │  ┌────────────────────────────┐      │
    │  │  MÓDULOS INTERNOS          │      │
    │  │  - formatquestion.py       │      │
    │  │  - randomid.py             │      │
    │  │  - connection.py           │      │
    │  │  - queries.py              │      │
    │  └────────────────────────────┘      │
    │                                       │
    └───────────────┬──────────────────────┘
                    │
              SQL CONNECTION
                    │
    ┌───────────────▼──────────────────┐
    │   SQL SERVER DATABASE            │
    │  ┌────────────────────────────┐  │
    │  │  Tabla: preguntas          │  │
    │  │  Tabla: config_qqi         │  │
    │  └────────────────────────────┘  │
    └────────────────────────────────┘
```

---

## 📈 Estadísticas del Proyecto

- **Archivos Backend:** 8 archivos Python
- **Archivos Frontend:** 15+ componentes React
- **Líneas de código:** ~1500+ líneas
- **Dependencias totales:** 20+
- **Base de datos:** SQL Server