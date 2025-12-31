from app.db.connection import connect_db
def playersconfig():
    connection = connect_db()
    if connection is None:
        print("No se pudo establecer conexión con la base de datos.")
    try:
        with connection.cursor() as cursor:  # Usa 'with' para manejar el cursor automáticamente
            query = 'SELECT Jugadores FROM config_qqi'
            cursor.execute(query)
            results = cursor.fetchall()
            if len(results) > 0:
                num_jugadores = results[0][0]
                #print(num_jugadores)
                return num_jugadores


    except Exception as error:  # Captura cualquier excepción general
        print(f"Error al ejecutar la consulta: {error}")
        return []

    finally:
        try:
            connection.close()
        except Exception as close_error:
            print(f"Error al cerrar la conexión: {close_error}")



def questionsconfig():
    connection = connect_db()
    if connection is None:
        print("No se pudo establecer conexión con la base de datos.")
        return []

    try:
        with connection.cursor() as cursor:  # Usa 'with' para manejar el cursor automáticamente
            query = 'SELECT NumeroPreguntas,Materia,NivelPregunta FROM config_qqi'
            cursor.execute(query)
            results = cursor.fetchall()
            if len(results) > 0:
                numpreguntas = results[0][0]  # Primer valor de 'NumeroPreguntas'
                materia = results[0][1]  # Primer valor de 'Materia'
                nivel = results[0][2]  # Primer valor de 'NivelPregunta'
                #print(f" Preguntas: {numpreguntas}, Materia: {materia}, Nivel: {nivel}")
                return numpreguntas, materia, nivel

    except Exception as error:  # Captura cualquier excepción general
        print(f"Error al ejecutar la consulta: {error}")
        return []

    finally:
        try:
            connection.close()
        except Exception as close_error:
            print(f"Error al cerrar la conexión: {close_error}")
def question(num_preguntas, materia, dificultad):
    connection = connect_db()
    if connection is None:
        print("No se pudo establecer conexión con la base de datos.")
        return []

    try:
        with connection.cursor() as cursor:
            query = '''
            SELECT TOP (?) idPregunta, question, option1, option2, option3, option4, answer
            FROM preguntas
            WHERE materia = ? 
              AND dificultad = ?
            '''
            # Ejecutar la consulta pasando los parámetros
            cursor.execute(query, (num_preguntas, materia, dificultad))
            results = cursor.fetchall()
            #print(results)
            return results
    except Exception as error:
        print(f"Error al ejecutar la consulta: {error}")
        return []
    finally:
        try:
            connection.close()  # Cierra la conexión al final
        except Exception as close_error:
            print(f"Error al cerrar la conexión: {close_error}")