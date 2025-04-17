from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
from typing import List, Dict, Optional
import os

def get_search_results(browser, question: str, max_results: int = 3) -> List[str]:
    """Get search results with improved filtering for Polish legal content."""
    try:
        # Add site:gov.pl and site:sejm.gov.pl to prioritize official sources
        # Add intitle: to find pages with question keywords in title
        # Add inurl:article or inurl:artykul to find article pages
        query = f"{question} intitle:{question.split()[0]} inurl:article OR inurl:artykul OR inurl:akt OR inurl:orzeczenie site:gov.pl OR site:sejm.gov.pl OR site:prawo.pl OR site:lex.pl"
        query = query.replace(" ", "+")
        search_url = f"https://www.google.com/search?q={query}&hl=pl&lr=lang_pl"
        
        browser.get(search_url)
        print(f"Searching for: {question}")
        
        # Wait for search results with increased timeout
        wait = WebDriverWait(browser, 15)
        try:
            wait.until(EC.presence_of_element_located((By.ID, "search")))
        except:
            print("Timeout waiting for search results, continuing anyway")
        
        time.sleep(3)  # Reduced wait time
        
        # Handle CAPTCHA
        if "consent.google.com" in browser.current_url or "sorry/index" in browser.current_url:
            print("⚠️ Google verification required! Please complete the CAPTCHA.")
            time.sleep(30)
        
        # Get page source and parse with BeautifulSoup
        soup = BeautifulSoup(browser.page_source, 'html.parser')
        
        # Find all result links
        valid_urls = []
        result_links = soup.find_all('a', href=True)
        
        for link in result_links:
            url = link['href']
            if url.startswith('http') and 'google' not in url:
                if is_valid_url(url):
                    # Check if the link text contains relevant keywords
                    link_text = link.get_text().lower()
                    keywords = ['artykuł', 'artykul', 'orzeczenie', 'wyrok', 'ustawa', 'rozporządzenie', 'akt']
                    if any(keyword in link_text for keyword in keywords):
                        valid_urls.append(url)
                        print(f"Found relevant URL: {url}")
                        if len(valid_urls) >= max_results:
                            break
        
        return valid_urls[:max_results]
    except Exception as e:
        print(f"Search error: {str(e)}")
        return []

def extract_content(browser, url: str) -> Optional[str]:
    """Extract relevant content with filtering."""
    try:
        browser.get(url)
        time.sleep(3)
        
        # Get main content using BeautifulSoup
        soup = BeautifulSoup(browser.page_source, 'html.parser')
        
        # Remove unwanted elements
        for element in soup.find_all(['header', 'footer', 'nav', 'aside', 'script', 'style']):
            element.decompose()
        
        # Find main content container
        main_content = None
        content_selectors = [
            'main', 'article', '.content', '.main-content', 
            '#content', '#main', '.article-content'
        ]
        
        for selector in content_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                break
        
        if not main_content:
            main_content = soup.body
        
        # Extract paragraphs with meaningful content
        paragraphs = []
        for element in main_content.find_all(['p', 'li', 'h1', 'h2', 'h3']):
            text = element.get_text().strip()
            if len(text) > 50:  # Only include substantial content
                # Remove citations and references
                text = re.sub(r'\[.*?\]', '', text)
                text = re.sub(r'\(.*?\)', '', text)
                paragraphs.append(text)
                if len(paragraphs) >= 3:  # Limit to 3 most relevant paragraphs
                    break
        
        # Join paragraphs and clean up
        content = '\n\n'.join(paragraphs)
        content = re.sub(r'\s+', ' ', content)  # Remove excessive whitespace
        content = content.strip()
        
        return content if content else None
        
    except Exception as e:
        print(f"Extraction error: {str(e)}")
        return None

def is_valid_url(url: str) -> bool:
    """Check if URL is valid and relevant for Polish legal content."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return False
        
        hostname = hostname.lower()
        
        # Prioritize official and legal sources
        preferred_domains = [
            'gov.pl', 'sejm.gov.pl', 'prawo.pl', 'lex.pl',
            'sip.lex.pl', 'orzeczenia.nsa.gov.pl', 'isap.sejm.gov.pl'
        ]
        
        # Check if URL is from a preferred domain
        for domain in preferred_domains:
            if hostname.endswith(domain) or f'.{domain}' in hostname:
                # Additional checks for article pages
                path = parsed.path.lower()
                article_indicators = ['/article/', '/artykul/', '/akt/', '/orzeczenie/', '/wyrok/']
                if any(indicator in path for indicator in article_indicators):
                    return True
                # Check for numeric IDs in path (common in article URLs)
                if re.search(r'/\d+', path):
                    return True
        
        # Block unwanted domains
        forbidden_domains = [
            'facebook.com', 'twitter.com', 'linkedin.com',
            'youtube.com', 'instagram.com', 'pinterest.com'
        ]
        
        for domain in forbidden_domains:
            if hostname.endswith(domain) or f'.{domain}' in hostname:
                return False
        
        # Check for document file extensions
        document_extensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt']
        if any(url.lower().endswith(ext) for ext in document_extensions):
            return False
        
        return True
    except Exception as e:
        print(f"URL validation error: {e}")
        return False

if __name__ == "__main__":
    try:
        # Set up Chrome options to use your existing Chrome profile
        chrome_options = Options()
        user_data_dir = "/Users/yusufyesilyurt/Library/Application Support/Google/Chrome"
        chrome_options.add_argument(f"user-data-dir={user_data_dir}")
        chrome_options.add_argument("--profile-directory=Default")
        
        # Anti-detection settings
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option("useAutomationExtension", False)
        
        # Add some random window size to look less like a bot
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--start-maximized")
        
        # Initialize browser
        service = Service('/usr/local/bin/chromedriver')
        browser = webdriver.Chrome(service=service, options=chrome_options)
        
        # Anti-detection JavaScript
        browser.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """
        })
        
        # Read questions
        file_path = os.path.join(os.path.dirname(__file__), "dolnoslaskie_legal_questions_polish.xlsx")
        df = pd.read_excel(file_path)
        questions = df["Questions"].tolist()
        
        results = []
        
        try:
            for question in questions:
                print(f"\nProcessing question: {question}")
                
                urls = get_search_results(browser, question, max_results=3)
                result_dict = {
                    'Question': question,
                    'Site1': '', 'Answer1': '',
                    'Site2': '', 'Answer2': '',
                    'Site3': '', 'Answer3': ''
                }
                
                for i, url in enumerate(urls, 1):
                    print(f"Extracting content from site {i}: {url}")
                    content = extract_content(browser, url)
                    if content:
                        result_dict[f'Site{i}'] = url
                        result_dict[f'Answer{i}'] = content
                    else:
                        print(f"No relevant content found on site {i}")
                
                results.append(result_dict)
                time.sleep(3)
                
        finally:
            browser.quit()
            
        # Create new DataFrame and save to Excel
        results_df = pd.DataFrame(results)
        output_path = os.path.join(os.path.dirname(__file__), 'legal_questions_answers.xlsx')
        results_df.to_excel(output_path, index=False)
        print(f"Results saved to {output_path}")
    
    except Exception as e:
        print(f"Critical error: {str(e)}")
        import traceback
        traceback.print_exc()


