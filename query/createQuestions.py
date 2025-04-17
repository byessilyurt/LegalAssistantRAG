import pandas as pd
import os
import re

def simplify_questions(questions):
    """
    Simplify questions by:
    1. Removing regional specifics like 'Dolnoslaskie'
    2. Making language simpler and more direct
    3. Focusing on common foreigner concerns in Poland
    """
    simplified_questions = []
    
    for question in questions:
        # Remove regional specifics
        simplified = re.sub(r'Dolno[sś]l[aą]skie[go]?', 'Polski', question)
        simplified = re.sub(r'w województwie', 'w', simplified)
        
        # Make simpler versions of complex questions
        if len(simplified.split()) > 12:
            # Try to extract the core question
            if 'jak' in simplified.lower():
                simplified = re.sub(r'^.*?(jak\s+\w+.*?)(?:\?|$)', r'Jak \1?', simplified, flags=re.IGNORECASE)
            elif 'czy' in simplified.lower():
                simplified = re.sub(r'^.*?(czy\s+\w+.*?)(?:\?|$)', r'Czy \1?', simplified, flags=re.IGNORECASE)
            elif 'gdzie' in simplified.lower():
                simplified = re.sub(r'^.*?(gdzie\s+\w+.*?)(?:\?|$)', r'Gdzie \1?', simplified, flags=re.IGNORECASE)
            elif 'kiedy' in simplified.lower():
                simplified = re.sub(r'^.*?(kiedy\s+\w+.*?)(?:\?|$)', r'Kiedy \1?', simplified, flags=re.IGNORECASE)
            elif 'co' in simplified.lower():
                simplified = re.sub(r'^.*?(co\s+\w+.*?)(?:\?|$)', r'Co \1?', simplified, flags=re.IGNORECASE)
        
        # Ensure question ends with question mark
        if not simplified.endswith('?'):
            simplified += '?'
        
        simplified_questions.append(simplified)
    
    return simplified_questions

def create_popular_questions():
    """
    Create a set of popular legal questions foreigners might have in Poland
    """
    popular_questions = [
        "Jak złożyć wniosek o kartę pobytu w Polsce?",
        "Jakie dokumenty są potrzebne do pracy w Polsce?",
        "Jak uzyskać PESEL w Polsce?",
        "Jak założyć firmę w Polsce jako cudzoziemiec?",
        "Jakie są prawa pracownika w Polsce?",
        "Jak zgłosić pobyt czasowy w Polsce?",
        "Jak uzyskać ubezpieczenie zdrowotne w Polsce?",
        "Jak wynająć mieszkanie w Polsce legalnie?",
        "Jakie podatki muszą płacić cudzoziemcy w Polsce?",
        "Jak nostryfikować dyplom w Polsce?",
        "Jak zapisać dziecko do szkoły w Polsce?",
        "Jak uzyskać prawo jazdy w Polsce?",
        "Jakie są warunki otrzymania obywatelstwa polskiego?",
        "Jak korzystać z publicznej służby zdrowia w Polsce?",
        "Jak otworzyć konto bankowe w Polsce?",
        "Jak zameldować się w Polsce?",
        "Jakie są zasady łączenia rodzin w Polsce?",
        "Jak przedłużyć wizę w Polsce?",
        "Jakie usługi są dostępne w urzędzie dla cudzoziemców?",
        "Jak zgłosić narodziny dziecka w Polsce?"
    ]
    return popular_questions

def main():
    # File paths
    file_path = os.path.join(os.path.dirname(__file__), "dolnoslaskie_legal_questions_polish.xlsx")
    
    # Read original questions
    df = pd.read_excel(file_path)
    original_questions = df["Questions"].tolist()
    
    # Simplify existing questions
    simplified_questions = simplify_questions(original_questions)
    
    # Add popular questions
    popular_questions = create_popular_questions()
    
    # Combine all questions (remove duplicates)
    all_questions = list(set(simplified_questions + popular_questions))
    
    # Create new dataframe
    new_df = pd.DataFrame({"Questions": all_questions})
    
    # Save back to the same file
    new_df.to_excel(file_path, index=False)
    print(f"Created {len(all_questions)} simplified questions and saved to {file_path}")
    
    # Print sample of new questions
    print("\nSample of new questions:")
    for q in all_questions[:5]:
        print(f"- {q}")

if __name__ == "__main__":
    main() 