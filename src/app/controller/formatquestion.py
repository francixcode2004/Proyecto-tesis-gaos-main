from app.db.queries import question,questionsconfig
# Función para formatear las preguntas desde la base de datos a JSON
def format_questions():
    #Obtener la configuracion desde la base de datos
    numpreguntas, materia, nivel = questionsconfig()
    # Obtener las preguntas desde la base de datos
    questions_from_db = question(numpreguntas,materia,nivel)  # Esto debería devolver una lista de tuplas, como [(1, '¿Cuando...', '1942', '1442', '1500', '1234', '1442')]
    # Crear una lista de preguntas en formato JSON
    formatted_questions = []
    
    for q in questions_from_db:
        formatted_question = {
            "id":q[0],
            "question":q[1],
            "option1":q[2],
            "option2":q[3],
            "option3":q[4],
            "option4":q[5],
            "answer":q[6]
        }
        formatted_questions.append(formatted_question)
    
    #print(formatted_questions)
    return formatted_questions

# Función para verificar si la respuesta es correcta
def checkanswer(selected_option, correct_answer):
    return selected_option == correct_answer

# Función que procesa las respuestas de los jugadores
def process_player_responses(player_responses, questions):
    # Lista para almacenar el resultado de las respuestas de los jugadores
    response_results = []

    # Iterar sobre las respuestas de los jugadores
    for player, selected_option in player_responses.items():
        # Obtener la pregunta correspondiente según el índice actual
        current_question = questions[player["current_question_index"]]
        
        # Verificar si la respuesta es correcta
        correct_answer = current_question["answer"]
        is_correct = checkanswer(selected_option, correct_answer)
        
        # Almacenar el resultado de la respuesta
        response_results.append({
            "player": player["name"],
            "selected_option": selected_option,
            "is_correct": is_correct,
            "correct_answer": correct_answer
        })

        # Actualizar el puntaje si la respuesta es correcta
        if is_correct:
            player["score"] += 100
    
    return response_results
