import json
import random

def reorganize_questions(file_path):
    """Reorganiza las opciones de cada pregunta aleatoriamente, manteniendo la respuesta correcta."""
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    for question in questions:
        # Guardar la respuesta correcta actual
        correct_index = question['correctAnswer']
        correct_answer = question['options'][correct_index]
        
        # Crear una lista de índices y barajarla
        indices = list(range(len(question['options'])))
        random.shuffle(indices)
        
        # Reorganizar las opciones según el nuevo orden
        new_options = [question['options'][i] for i in indices]
        
        # Encontrar la nueva posición de la respuesta correcta
        new_correct_index = indices.index(correct_index)
        
        # Actualizar la pregunta
        question['options'] = new_options
        question['correctAnswer'] = new_correct_index
    
    # Guardar el archivo actualizado
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Reorganizado {len(questions)} preguntas en {file_path}")

# Reorganizar ambos archivos
if __name__ == "__main__":
    random.seed()  # Usar una semilla aleatoria diferente cada vez
    reorganize_questions('questions_artist.json')
    reorganize_questions('questions_programmer.json')
    print("\n¡Reorganización completada!")

