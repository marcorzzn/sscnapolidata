"""
Resilient HTTP and Browser Fetcher with Gzip Disk Cache, Rate Limiting, and WAF protection.
"""

from __future__ import annotations
import gzip
import hashlib
import json
import logging
import random
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional
import requests
from bs4 import BeautifulSoup

from .config import CACHE_DIR, DEFAULT_HEADERS, API_HEADERS

log = logging.getLogger("napoli_scraper.fetcher")


@dataclass
class FetchResult:
    url: str
    status: int
    content: str
    is_cached: bool = False
    is_json: bool = False
    json_data: Optional[Dict[str, Any]] = None
    soup: Optional[BeautifulSoup] = None


class Fetcher:
    def __init__(
        self,
        cache_dir: Path = CACHE_DIR,
        delay: float = 1.0,
        retries: int = 3,
        use_cache: bool = True,
    ):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.delay = delay
        self.retries = retries
        self.use_cache = use_cache
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)
        self._last_request_time = 0.0
        self._pw = None
        self._browser = None
        self._browser_ctx = None

    def _ensure_browser(self):
        if self._browser is None:
            from playwright.sync_api import sync_playwright
            log.info("Starting headless Playwright Chromium for anti-bot / WAF bypass...")
            self._pw = sync_playwright().start()
            self._browser = self._pw.chromium.launch(headless=True)
            self._browser_ctx = self._browser.new_context(
                user_agent=DEFAULT_HEADERS["User-Agent"],
                locale="en-US",
                viewport={"width": 1440, "height": 900},
            )
            self._browser_page = self._browser_ctx.new_page()

    def _fetch_playwright(self, url: str) -> Optional[FetchResult]:
        """Fetch URL using Playwright Chromium to bypass Cloudflare / AWS WAF."""
        try:
            self._ensure_browser()
            page = self._browser_page
            self._rate_limit()
            log.info(f"Playwright GET {url}")
            resp = page.goto(url, wait_until="domcontentloaded", timeout=35000)
            status = resp.status if resp else 200

            # If Cloudflare challenge detected, give it a moment to solve
            if status in (403, 503) or "moment" in page.title().lower() or "challenge" in page.content().lower():
                page.wait_for_timeout(3500)
                status = 200 if ("moment" not in page.title().lower() and "challenge" not in page.title().lower()) else 403

            html = page.content()

            if status == 200 and html and "Just a moment..." not in html:
                self._put_cache(url, html, is_json=False)
                soup = BeautifulSoup(html, "lxml")
                return FetchResult(url=url, status=200, content=html, is_cached=False, soup=soup)
            else:
                log.warning(f"Playwright returned status {status} for {url}")
                return None
        except Exception as e:
            log.warning(f"Playwright fetch error on {url}: {e}")
            return None

    def close(self):
        """Close browser resources cleanly."""
        if self._browser:
            try:
                self._browser.close()
            except Exception:
                pass
        if self._pw:
            try:
                self._pw.stop()
            except Exception:
                pass

    def _cache_path(self, url: str, is_json: bool = False) -> Path:
        h = hashlib.sha1(url.encode("utf-8")).hexdigest()
        ext = ".json.gz" if is_json else ".html.gz"
        return self.cache_dir / f"{h}{ext}"

    def _get_cache(self, url: str, is_json: bool = False) -> Optional[FetchResult]:
        if not self.use_cache:
            return None
        cp = self._cache_path(url, is_json)
        if not cp.exists():
            return None
        try:
            raw = gzip.decompress(cp.read_bytes()).decode("utf-8")
            if is_json:
                data = json.loads(raw)
                return FetchResult(url=url, status=200, content=raw, is_cached=True, is_json=True, json_data=data)
            else:
                soup = BeautifulSoup(raw, "lxml")
                return FetchResult(url=url, status=200, content=raw, is_cached=True, soup=soup)
        except Exception as e:
            log.warning(f"Error reading cache for {url}: {e}")
            return None

    def _put_cache(self, url: str, content: str, is_json: bool = False):
        if not self.use_cache:
            return
        cp = self._cache_path(url, is_json)
        try:
            cp.write_bytes(gzip.compress(content.encode("utf-8")))
        except Exception as e:
            log.warning(f"Error writing cache for {url}: {e}")

    def _rate_limit(self):
        now = time.time()
        elapsed = now - self._last_request_time
        target_delay = self.delay * random.uniform(0.8, 1.3)
        if elapsed < target_delay:
            time.sleep(target_delay - elapsed)
        self._last_request_time = time.time()

    def fetch_html(self, url: str) -> FetchResult:
        """Fetch HTML page with cache, rate limiting, and retries."""
        cached = self._get_cache(url, is_json=False)
        if cached:
            return cached

        last_error = None
        for attempt in range(1, self.retries + 1):
            self._rate_limit()
            try:
                log.info(f"GET {url} (attempt {attempt})")
                r = self.session.get(url, timeout=25)
                if r.status_code == 200:
                    self._put_cache(url, r.text, is_json=False)
                    soup = BeautifulSoup(r.text, "lxml")
                    return FetchResult(url=url, status=200, content=r.text, is_cached=False, soup=soup)
                elif r.status_code == 404:
                    log.warning(f"404 Not Found: {url}")
                    return FetchResult(url=url, status=404, content="", is_cached=False)
                elif r.status_code in (403, 405) or (r.status_code == 200 and "challenge-platform" in r.text):
                    log.info(f"Cloudflare/WAF detected on {url} (status {r.status_code}), falling back to Playwright...")
                    pw_res = self._fetch_playwright(url)
                    if pw_res:
                        return pw_res
                    time.sleep(2 ** attempt)
                elif r.status_code in (429, 500, 502, 503, 504):
                    backoff = (2 ** attempt) + random.uniform(1, 3)
                    log.warning(f"Status {r.status_code} on {url}, backing off {backoff:.1f}s...")
                    time.sleep(backoff)
                else:
                    log.warning(f"Unexpected status {r.status_code} on {url}")
                    return FetchResult(url=url, status=r.status_code, content=r.text, is_cached=False)
            except Exception as exc:
                last_error = exc
                backoff = (2 ** attempt) + random.uniform(1, 2)
                log.warning(f"Request error {exc} on {url}, retrying in {backoff:.1f}s...")
                time.sleep(backoff)

        log.error(f"Failed to fetch {url} after {self.retries} attempts: {last_error}")
        return FetchResult(url=url, status=500, content="", is_cached=False)

    def fetch_json(self, url: str) -> FetchResult:
        """Fetch JSON API endpoint with cache, rate limiting, and retries."""
        cached = self._get_cache(url, is_json=True)
        if cached:
            return cached

        last_error = None
        headers = API_HEADERS.copy()

        for attempt in range(1, self.retries + 1):
            self._rate_limit()
            try:
                log.info(f"GET JSON {url} (attempt {attempt})")
                r = requests.get(url, headers=headers, timeout=20)
                if r.status_code == 200:
                    data = r.json()
                    self._put_cache(url, r.text, is_json=True)
                    return FetchResult(
                        url=url, status=200, content=r.text, is_cached=False, is_json=True, json_data=data
                    )
                elif r.status_code == 404:
                    log.warning(f"404 JSON Not Found: {url}")
                    return FetchResult(url=url, status=404, content="", is_cached=False, is_json=True)
                elif r.status_code in (429, 500, 502, 503, 504):
                    backoff = (2 ** attempt) + random.uniform(1, 2)
                    time.sleep(backoff)
                else:
                    return FetchResult(url=url, status=r.status_code, content=r.text, is_cached=False, is_json=True)
            except Exception as exc:
                last_error = exc
                time.sleep(2 ** attempt)

        log.error(f"Failed to fetch JSON {url}: {last_error}")
        return FetchResult(url=url, status=500, content="", is_cached=False, is_json=True)
