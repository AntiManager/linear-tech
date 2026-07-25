#!/usr/bin/env python3
"""Download all images and PDFs from saved markdown pages."""

import os
import re
import hashlib
import time
from pathlib import Path
from urllib.parse import urlparse, unquote, urljoin

import requests

BASE_DIR = Path(__file__).resolve().parent.parent
PAGES_DIR = BASE_DIR / "data" / "content" / "pages"
IMAGES_DIR = BASE_DIR / "data" / "images"
PDF_DIR = BASE_DIR / "data" / "pdf"
BASE_URL = "https://www.linear-tech.ru"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
DELAY = 0.5


def is_same_domain(url: str) -> bool:
    domain = urlparse(url).netloc.lower().replace("www.", "")
    target = urlparse(BASE_URL).netloc.lower().replace("www.", "")
    return domain == target


def download(url: str, dest_dir: Path) -> bool:
    parsed = urlparse(url)
    fname = os.path.basename(unquote(parsed.path))
    if not fname or len(fname) > 100:
        fname = hashlib.md5(url.encode()).hexdigest()[:12] + (os.path.splitext(parsed.path)[1] or ".bin")
    fname = re.sub(r"[^\w.\-]", "_", fname)
    dest = dest_dir / fname
    if dest.exists() and dest.stat().st_size > 0:
        return True  # already downloaded
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        r.raise_for_status()
        dest.write_bytes(r.content)
        print(f"  [OK] {fname} ({len(r.content)} bytes)")
        return True
    except Exception as e:
        print(f"  [--] {url}: {e}")
        return False


def main():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    # Collect all media URLs from markdown files
    media_urls = set()
    for md_file in sorted(PAGES_DIR.rglob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        # URLs in markdown links
        for m in re.findall(r"https?://[^\s)'\"<>\[\]]+", text):
            url = m.strip(".,;:!?\"'()[]")
            if is_same_domain(url) and urlparse(url).path.lower().endswith((".pdf", ".gif", ".png", ".jpg", ".jpeg", ".svg")):
                media_urls.add(url)

    print(f"[*] Found {len(media_urls)} unique media URLs across {len(list(PAGES_DIR.rglob('*.md')))} pages")

    # Download PDFs first
    pdfs = sorted(u for u in media_urls if u.lower().endswith(".pdf"))
    print(f"[*] Downloading {len(pdfs)} PDFs...")
    for url in pdfs:
        download(url, PDF_DIR)
        time.sleep(DELAY)

    # Download images
    imgs = sorted(u for u in media_urls if not u.lower().endswith(".pdf"))
    print(f"[*] Downloading {len(imgs)} images...")
    for url in imgs:
        download(url, IMAGES_DIR)
        time.sleep(DELAY)

    img_count = len([f for f in IMAGES_DIR.iterdir() if f.is_file() and f.name != ".gitkeep"])
    pdf_count = len([f for f in PDF_DIR.iterdir() if f.is_file() and f.name != ".gitkeep"])
    print(f"\n[DONE] Downloaded: {img_count} images, {pdf_count} PDFs")


if __name__ == "__main__":
    main()
