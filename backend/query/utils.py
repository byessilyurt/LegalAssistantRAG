from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import inch
import pandas as pd
import re
import os

# Register a Unicode font that supports Polish characters
pdfmetrics.registerFont(TTFont('DejaVuSerif', 'DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', 'DejaVuSerif-Bold.ttf'))

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

def create_questions():
    """
    Create simplified questions for Polish legal system for foreigners.
    Reads from the original questions file, simplifies them, adds popular questions,
    and saves the result back to the Excel file.
    """
    # File paths
    file_path = os.path.join(os.path.dirname(__file__), "POL_legal_questions.xlsx")
    
    # Read original questions
    try:
        df = pd.read_excel(file_path)
        original_questions = df["Questions"].tolist()
    except (FileNotFoundError, KeyError):
        print(f"Creating new questions file at {file_path}")
        original_questions = []
    
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
    
    return file_path

def clean_text(text):
    """Convert any value to string and handle None/NaN values."""
    if pd.isna(text):  # Check for NaN/None values
        return ""
    return str(text).strip()

def create_pdf(excel_file, pdf_file):
    # Read the Excel file with UTF-8 encoding
    df = pd.read_excel(excel_file)
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Create styles with Unicode font
    styles = getSampleStyleSheet()
    
    # Custom styles for different elements with Unicode font
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontName='DejaVuSerif-Bold',
        fontSize=16,
        spaceAfter=30,
        textColor=colors.HexColor('#2c3e50')
    )
    
    question_style = ParagraphStyle(
        'CustomQuestion',
        parent=styles['Heading2'],
        fontName='DejaVuSerif-Bold',
        fontSize=14,
        spaceAfter=20,
        textColor=colors.HexColor('#34495e')
    )
    
    url_style = ParagraphStyle(
        'CustomURL',
        parent=styles['Normal'],
        fontName='DejaVuSerif',
        fontSize=10,
        textColor=colors.blue,
        spaceAfter=10
    )
    
    answer_style = ParagraphStyle(
        'CustomAnswer',
        parent=styles['Normal'],
        fontName='DejaVuSerif',
        fontSize=11,
        leading=14,
        spaceAfter=20
    )
    
    # Build the PDF content
    content = []
    
    # Add title
    content.append(Paragraph("Legal Questions and Answers", title_style))
    content.append(Spacer(1, 20))
    
    # Process each row
    for index, row in df.iterrows():
        # Add question (ensure it's a string)
        question_text = clean_text(row['Question'])
        content.append(Paragraph(f"Question {index + 1}: {question_text}", question_style))
        
        # Add each answer and its source
        for i in range(1, 4):
            site_key = f'Site{i}'
            answer_key = f'Answer{i}'
            
            # Get and clean the site and answer text
            site = clean_text(row[site_key])
            answer = clean_text(row[answer_key])
            
            if site and answer:  # Only process if both site and answer exist
                # Add source URL
                content.append(Paragraph(f"Source {i}: {site}", url_style))
                
                # Split answer text into paragraphs and add each
                paragraphs = answer.split('\n\n')
                for p in paragraphs:
                    if p.strip():
                        # Replace any special characters that might cause issues
                        p = p.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        content.append(Paragraph(p, answer_style))
                
                content.append(Spacer(1, 20))
        
        # Add space between questions
        content.append(Spacer(1, 30))
    
    # Build the PDF
    doc.build(content)

def translate_to_english(excel_file, output_file=None):
    """
    Translates the content of the Excel file from Polish to English using DeepL API
    and saves as a new Excel file.
    
    Args:
        excel_file (str): Path to the Excel file containing Polish content
        output_file (str, optional): Path for the output Excel file with English translations.
            If None, appends '_english' to the original filename.
    """
    import deepl
    from dotenv import load_dotenv
    
    # Load API key from .env file
    load_dotenv()
    deepl_api_key = os.getenv('DEEPL_API_KEY')
    
    if not deepl_api_key:
        raise ValueError("DeepL API key not found in .env file. Add DEEPL_API_KEY=your_key")
    
    # Create DeepL translator
    translator = deepl.Translator(deepl_api_key)
    
    # Generate output file name if not provided
    if output_file is None:
        base, ext = os.path.splitext(excel_file)
        output_file = f"{base}_english{ext}"
    
    print(f"Reading file: {excel_file}")
    # Read Excel file
    df = pd.read_excel(excel_file)
    
    # Translate each column with text content
    text_columns = ['Question']
    for i in range(1, 4):  # Process Answer1, Answer2, Answer3
        text_columns.append(f'Answer{i}')
    
    # Create a new DataFrame for translated content
    translated_df = df.copy()
    
    total_rows = len(df)
    for col in text_columns:
        print(f"Translating column: {col}")
        for idx, text in enumerate(df[col]):
            if pd.notna(text) and text.strip():  # Check if text exists and is not empty
                print(f"  Row {idx+1}/{total_rows}", end="\r")
                try:
                    translated_text = translator.translate_text(
                        text, 
                        source_lang="PL", 
                        target_lang="EN-US"
                    ).text
                    translated_df.at[idx, col] = translated_text
                except Exception as e:
                    print(f"  Error translating row {idx+1}, column {col}: {e}")
    
    # Save translated content to a new Excel file
    translated_df.to_excel(output_file, index=False)
    print(f"\nSuccessfully created {output_file}")
    return output_file

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "translate":
            # Run translation
            excel_file = "legal_questions_answers.xlsx"
            output_file = "legal_questions_answers_english.xlsx"
            
            try:
                translate_to_english(excel_file, output_file)
            except ImportError:
                print("Error: DeepL package is required. Install it with: pip install deepl")
        elif sys.argv[1] == "create_questions":
            # Run question creation
            try:
                create_questions()
            except Exception as e:
                print(f"Error creating questions: {e}")
        else:
            # Default behavior - create PDF
            excel_file = "legal_questions_answers.xlsx"
            pdf_file = "legal_questions_answers.pdf"
            
            try:
                create_pdf(excel_file, pdf_file)
                print(f"Successfully created {pdf_file}")
            except Exception as e:
                print(f"Error creating PDF: {e}")


