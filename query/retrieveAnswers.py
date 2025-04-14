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

def get_search_results(browser, question, max_results=3):
    """Get search results, checking only for robot verification."""
    try:
        query = question.replace(" ", "+")
        search_url = f"https://www.google.com/search?q={query}&hl=pl&lr=lang_pl"
        
        browser.get(search_url)
        print(f"Loaded search page URL: {browser.current_url}")
        
        # Wait for search results to load with explicit wait
        wait = WebDriverWait(browser, 10)
        try:
            wait.until(EC.presence_of_element_located((By.ID, "search")))
            print("Search results container loaded")
        except:
            print("Timeout waiting for search results container, continuing anyway")
        
        time.sleep(5)  # Additional wait time
        
        if "consent.google.com" in browser.current_url or "sorry/index" in browser.current_url:
            print("\n⚠️ Google verification required! Please complete the CAPTCHA. Waiting 30 seconds...")
            time.sleep(30)  # Give more time to solve CAPTCHA
            
        # Debug: Save page source for inspection
        with open("google_page_source.html", "w", encoding="utf-8") as f:
            f.write(browser.page_source)
        print("Saved page source to google_page_source.html for debugging")
        
        # Try multiple selectors that might match Google result links
        selectors = [
            "a[href^='http']:not([href*='google.com']):not([href*='accounts.google']):not([href*='support.google'])",
            "div.g a[href^='http']", 
            "div.yuRUbf > a",
            ".DhN8Cf a[href^='http']",
            ".v5yQqb a[ping]",
            ".tF2Cxc a",
            "h3.LC20lb + div a",
            ".kCrYT > a",
            "#search a[href^='http']:not([href*='google'])",
            "#rso a[href^='http']"
        ]
        
        valid_urls = []
        for selector in selectors:
            print(f"Trying selector: {selector}")
            elements = browser.find_elements(By.CSS_SELECTOR, selector)
            print(f"  Found {len(elements)} elements")
            
            for elem in elements:
                try:
                    url = elem.get_attribute("href")
                    if url and url.startswith("http") and "google" not in url and url not in valid_urls:
                        if is_valid_url(url):
                            valid_urls.append(url)
                            print(f"Added valid URL: {url}")
                            if len(valid_urls) >= max_results:
                                break
                except Exception as e:
                    print(f"Error extracting URL: {e}")
            
            if len(valid_urls) >= max_results:
                break
        
        # If no URLs found, try fallback method with BeautifulSoup
        if not valid_urls:
            print("No URLs found with selectors, trying fallback method with BeautifulSoup")
            soup = BeautifulSoup(browser.page_source, 'html.parser')
            for a_tag in soup.find_all('a', href=True):
                url = a_tag['href']
                # Check if this looks like a result URL (not a Google internal link)
                if url.startswith('http') and 'google' not in url and url not in valid_urls:
                    if is_valid_url(url):
                        valid_urls.append(url)
                        print(f"Added valid URL via fallback: {url}")
                        if len(valid_urls) >= max_results:
                            break
                
        print(f"Total valid URLs found: {len(valid_urls)}")
        return valid_urls
    except Exception as e:
        print(f"Search error: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def extract_content(browser, url):
    """Extract all relevant content from the page, limited to 15 paragraphs."""
    try:
        browser.get(url)
        time.sleep(3)
        
        # Get main content using BeautifulSoup
        soup = BeautifulSoup(browser.page_source, 'html.parser')
        
        # Remove unwanted elements
        for element in soup.find_all(['header', 'footer', 'nav', 'aside', 'script', 'style']):
            element.decompose()

        # Block Google Translate URLs
        # todo
        
        # Find all paragraphs with meaningful content
        paragraphs = []
        for element in soup.find_all(['p', 'li']):
            text = element.get_text().strip()
            paragraphs.append(text)
            # Break if we've reached 15 paragraphs
            if len(paragraphs) >= 5:
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
        
        # Specify the path to ChromeDriver
        service = Service('/usr/local/bin/chromedriver')
        print("Initializing Chrome browser...")
        browser = webdriver.Chrome(service=service, options=chrome_options)
        
        # Add anti-detection JavaScript
        browser.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """
        })
        
        print("Chrome browser initialized successfully")

        # Read questions from Excel
        file_path = "dolnoslaskie_legal_questions_polish.xlsx"
        df = pd.read_excel(file_path)
        questions = df["Questions"].tolist()
        
        # Create lists to store results
        results = []
        
        try:
            # Testing browser functionality
            print("Testing browser with a simple page...")
            browser.get("https://www.google.com")
            print(f"Current page title: {browser.title}")
            
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
                    print(f"Checking site {i}: {url}")
                    content = extract_content(browser, url)
                    if content:
                        result_dict[f'Site{i}'] = url
                        result_dict[f'Answer{i}'] = content
                    else:
                        print(f"No content extracted from site {i}")
                
                results.append(result_dict)
                time.sleep(3)
                
        finally:
            browser.quit()
            
        # Create new DataFrame and save to Excel
        results_df = pd.DataFrame(results)
        results_df.to_excel('legal_questions_answers.xlsx', index=False)
        print("Results saved to legal_questions_answers.xlsx")
    
    except Exception as e:
        print(f"Critical error: {str(e)}")
        import traceback
        traceback.print_exc()


