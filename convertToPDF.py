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

if __name__ == "__main__":
    excel_file = "legal_questions_answers.xlsx"
    pdf_file = "legal_questions_answers.pdf"
    
    try:
        create_pdf(excel_file, pdf_file)
        print(f"Successfully created {pdf_file}")
    except Exception as e:
        print(f"Error creating PDF: {e}")
