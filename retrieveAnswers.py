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
from urllib.parse import urlparse

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
    """Get search results, checking only for robot verification."""
    try:
        query = question.replace(" ", "+")
        search_url = f"https://www.google.com/search?q={query}&hl=pl&lr=lang_pl"
        
        browser.get(search_url)
        time.sleep(3)
        
        if "consent.google.com" in browser.current_url or "sorry/index" in browser.current_url:
            print("\n⚠️ Google verification required! Please complete the CAPTCHA. Waiting 15 seconds...")
            time.sleep(15)
        
        elements = browser.find_elements(By.CSS_SELECTOR, "div.g a")
        valid_urls = []
        for elem in elements:
            url = elem.get_attribute("href")
            if url and is_valid_url(url):
                valid_urls.append(url)
            if len(valid_urls) >= max_results:
                break
                
        return valid_urls
    except Exception as e:
        print(f"Search error: {str(e)}")
        return []

def extract_content(browser, url):
    """Extract all relevant content from the page, limited to 15 paragraphs."""
    try:
        browser.get(url)
        time.sleep(3)
        
        # Check if the page is trying to download a file
        current_url = browser.current_url.lower()
        if any(ext in current_url for ext in ['.pdf', '.doc', '.docx', '.rtf']):
            print(f"Skipping URL {url} - detected document download")
            return None
        
        # Get main content using BeautifulSoup
        soup = BeautifulSoup(browser.page_source, 'html.parser')
        
        # Remove unwanted elements
        for element in soup.find_all(['header', 'footer', 'nav', 'aside', 'script', 'style']):
            element.decompose()
        
        # Find all paragraphs with meaningful content
        paragraphs = []
        for element in soup.find_all(['p', 'li']):
            text = element.get_text().strip()
            # Only include longer paragraphs
            if len(text) > 100:
                paragraphs.append(text)
                # Break if we've reached 15 paragraphs
                if len(paragraphs) >= 15:
                    break
        
        return '\n\n'.join(paragraphs) if paragraphs else None
        
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        return None

def is_valid_url(url):
    """Check if URL is valid by excluding PDFs, DOCs and forbidden domains."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False
        
        hostname = hostname.lower()
        
        # Specific URL to block
        if url.startswith('https://www.gov.pl/web/dolnoslaski-uw'):
            return False
            
        # Block Google Translate URLs
        if 'translate.google' in hostname or 'translate.goog' in hostname:
            return False
            
        # Block forbidden domains and their subdomains
        forbidden_domains = [
            'gov.pl', 'europa.eu', 'sejm.gov.pl',
            'pitax.pl', 'infor.pl', 'lex.pl'
        ]
        
        for domain in forbidden_domains:
            if hostname.endswith(domain) or f'.{domain}' in hostname:
                print(f"Skipping forbidden domain: {hostname}")
                return False
                
        # Check for document file extensions in URL
        document_extensions = ['.pdf', '.doc', '.docx', '.rtf']
        if any(url.lower().endswith(ext) for ext in document_extensions):
            return False
            
        return True
    except Exception as e:
        print("URL validation error:", e)
        return False

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
            
            urls = get_search_results(browser, question, max_results=3)
            result_dict = {
                'Question': question,
                'Site1': '', 'Answer1': '',
                'Site2': '', 'Answer2': '',
                'Site3': '', 'Answer3': ''
            }
            
            for i, url in enumerate(urls, 1):
                if not is_valid_url(url):
                    continue
                print(f"Checking site {i}: {url}")
                content = extract_content(browser, url)
                if content:
                    result_dict[f'Site{i}'] = url
                    result_dict[f'Answer{i}'] = content
            
            results.append(result_dict)
            time.sleep(3)
            
    finally:
        browser.quit()
        
    # Create new DataFrame and save to Excel
    results_df = pd.DataFrame(results)
    results_df.to_excel('legal_questions_answers.xlsx', index=False)
    print("Results saved to legal_questions_answers.xlsx")


