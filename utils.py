from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import inch
import pandas as pd

# Register a Unicode font that supports Polish characters
pdfmetrics.registerFont(TTFont('DejaVuSerif', 'DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerif-Bold', 'DejaVuSerif-Bold.ttf'))

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
    import os
    import pandas as pd
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
    
    if len(sys.argv) > 1 and sys.argv[1] == "translate":
        # Run translation
        excel_file = "legal_questions_answers.xlsx"
        output_file = "legal_questions_answers_english.xlsx"
        
        try:
            translate_to_english(excel_file, output_file)
        except ImportError:
            print("Error: DeepL package is required. Install it with: pip install deepl")
    else:
        # Default behavior - create PDF
        excel_file = "legal_questions_answers.xlsx"
        pdf_file = "legal_questions_answers.pdf"
        
        try:
            create_pdf(excel_file, pdf_file)
            print(f"Successfully created {pdf_file}")
        except Exception as e:
            print(f"Error creating PDF: {e}")


