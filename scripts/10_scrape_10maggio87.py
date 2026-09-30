import asyncio
import json
import os
import argparse
from playwright.async_api import async_playwright

BASE_URL = "https://www.10maggio87.it/Almanacco/Napoli/"

async def scrape_season(season_str: str):
    """
    Scrape a specific season (e.g. '2026-27') from 10maggio87.it
    """
    url = f"{BASE_URL}{season_str}/"
    print(f"Scraping {url}...")
    
    matches = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until="networkidle")
            # The site uses React, so we wait for the main table to appear
            # Adjust selector based on actual DOM once inspected
            await page.wait_for_timeout(3000)  # Basic delay to ensure render
            
            print("Page loaded. Extracting matches...")
            # Placeholder for actual parsing logic based on React DOM
            # Currently just setting up the architecture for the scraper
            
            # TODO: Extract rows from the matches table
            # e.g. date, opponent, competition, result, scorers
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            
        finally:
            await browser.close()
            
    return matches

def main():
    parser = argparse.ArgumentParser(description="Scrape 10maggio87.it")
    parser.add_argument("--season", type=str, default="2026-27", help="Season to scrape (e.g. 2026-27)")
    args = parser.parse_args()
    
    # Run async scraper
    results = asyncio.run(scrape_season(args.season))
    
    # Save to JSON
    if results:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        out_file = os.path.join(data_dir, f"10maggio87_{args.season}.json")
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(results)} matches to {out_file}")
    else:
        print("No matches extracted. Check selectors and page structure.")

if __name__ == "__main__":
    main()
