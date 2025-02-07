from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time
from bs4 import BeautifulSoup
import re

def handle_cookie_popups(browser):
    """Handle various types of cookie consent popups."""
    try:
        # Common cookie acceptance button texts (English and Polish)
        cookie_buttons = [
            "//button[contains(text(), 'Accept All') or contains(text(), 'Zgadzam się') or contains(text(), 'Akceptuję') or contains(text(), 'Accept cookies')]",
            "//button[contains(@class, 'cookie') and (contains(@class, 'accept') or contains(@class, 'agree'))]",
            "//div[contains(@class, 'cookie')]//button",
            "//div[contains(@id, 'cookie')]//button"
        ]
        
        for xpath in cookie_buttons:
            try:
                WebDriverWait(browser, 3).until(
                    EC.presence_of_element_located((By.XPATH, xpath))
                )
                button = browser.find_element(By.XPATH, xpath)
                button.click()
                time.sleep(1)
                return True
            except:
                continue
        return False
    except:
        return False

def get_search_results(browser, question, max_results=3):
    """Get search results excluding PDFs and government sites."""
    try:
        # Exclude government sites and PDFs
        exclude_sites = "-site:gov.pl -site:europa.eu -site:sejm.gov.pl -filetype:pdf"
        query = f"{question} {exclude_sites}"
        search_url = f"https://www.google.com/search?q={query}"
        
        browser.get(search_url)
        time.sleep(3)
        
        # Check for CAPTCHA/robot check
        if "consent.google.com" in browser.current_url or "sorry/index" in browser.current_url:
            print("\n⚠️ Google verification required!")
            print("Please complete the verification in the browser...")
            print("Waiting 15 seconds...")
            time.sleep(15)
        
        # Get all result links
        results = browser.find_elements(By.CSS_SELECTOR, "div.g a")
        valid_urls = []
        
        for result in results:
            url = result.get_attribute("href")
            # Skip if URL contains PDF indicators
            if url and not any(x in url.lower() for x in ['.pdf', '/pdf', 'pdf/', 'viewpdf']):
                valid_urls.append(url)
            if len(valid_urls) >= max_results:
                break
                
        return valid_urls
        
    except Exception as e:
        print(f"Search error: {str(e)}")
        return []

def extract_content(browser, url, question):
    """Simplified content extraction focusing on relevance."""
    try:
        browser.get(url)
        time.sleep(3)
        
        # Handle cookie popups
        handle_cookie_popups(browser)
        
        # Get main content using BeautifulSoup
        soup = BeautifulSoup(browser.page_source, 'html.parser')
        
        # Remove unwanted elements
        for element in soup.find_all(['header', 'footer', 'nav', 'aside', 'script', 'style']):
            element.decompose()
        
        # Find paragraphs with meaningful content
        paragraphs = []
        for element in soup.find_all(['p', 'li']):
            text = element.get_text().strip()
            # Only include longer paragraphs
            if len(text) > 100:
                paragraphs.append(text)
        
        # Take up to 5 most relevant paragraphs
        return '\n\n'.join(paragraphs[:5]) if paragraphs else None
        
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        return None

def is_valid_url(url):
    """Check if URL is valid (no PDFs or government sites)."""
    lower_url = url.lower()
    pdf_indicators = ['.pdf', '/pdf', 'pdf/', 'viewpdf']
    gov_domains = ['gov.pl', 'europa.eu', 'sejm.gov.pl']
    
    if any(x in lower_url for x in pdf_indicators):
        return False
    if any(domain in lower_url for domain in gov_domains):
        return False
    return True

if __name__ == "__main__":
    # Set up Chrome options to use your existing Chrome profile
    chrome_options = Options()
    user_data_dir = "/Users/yusufyesilyurt/Library/Application Support/Google/Chrome"
    chrome_options.add_argument(f"user-data-dir={user_data_dir}")
    chrome_options.add_argument("--profile-directory=Default")

    # Specify the path to ChromeDriver
    service = Service('/usr/local/bin/chromedriver')
    browser = webdriver.Chrome(service=service, options=chrome_options)

    # Read questions from Excel
    file_path = "dolnoslaskie_legal_questions_polish.xlsx"
    df = pd.read_excel(file_path)
    questions = df["Questions"].tolist()
    
    # Create lists to store results
    results = []
    
    try:
        for question in questions:
            print(f"\nSearching for: {question}")
            
            # Get search results
            urls = get_search_results(browser, question)
            
            # Try each URL until we find content
            content = None
            for url in urls:
                if not is_valid_url(url):
                    continue
                print(f"Checking: {url}")
                content = extract_content(browser, url, question)
                if content:
                    break
            
            results.append({
                'Question': question,
                'Answer': content if content else 'No relevant content found'
            })
            
            time.sleep(3)
    
    finally:
        browser.quit()
        
    # Create new DataFrame and save to Excel
    results_df = pd.DataFrame(results)
    results_df.to_excel('legal_questions_answers.xlsx', index=False)
    print("Results saved to legal_questions_answers.xlsx")
