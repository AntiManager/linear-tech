#!/usr/bin/env python3
"""Парсер контента с linear-tech.ru"""

import os
import re
import json
import time
import hashlib
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from typing import Optional

import requests
from bs4 import BeautifulSoup, Tag

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CONTENT_DIR = DATA_DIR / "content"
PAGES_DIR = CONTENT_DIR / "pages"
IMAGES_DIR = DATA_DIR / "images"
PDF_DIR = DATA_DIR / "pdf"

BASE_URL = "https://www.linear-tech.ru"
SITEMAP_URL = f"{BASE_URL}/sitemap.xml"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
}
DELAY = 1.0  # seconds between requests
MEDIA_URLS_CACHE = set()


def ensure_dirs():
    for d in [PAGES_DIR, IMAGES_DIR, PDF_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def norm_url(url: str) -> str:
    """Normalize URL for comparison: strip protocol and www."""
    return url.lower().replace("http://", "").replace("https://", "").replace("www.", "").rstrip("/")


def safe_filename(url: str) -> str:
    """Convert URL to a safe relative file path (no leading / on Windows)."""
    parsed = urlparse(url)
    path = unquote(parsed.path.strip("/"))
    if not path or path.endswith("/"):
        path = "index"
    else:
        path = path.replace(".html", "")
    path = re.sub(r"[^\w\-/]+", "_", path)
    path = re.sub(r"_+", "_", path).strip("_")
    # Strip leading separator (critical on Windows — /index → C:\index)
    path = path.lstrip("/\\")
    return path or "index"


def download_file(url: str, dest_dir: Path) -> Optional[str]:
    try:
        r = requests.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        r.raise_for_status()
        parsed = urlparse(url)
        fname = os.path.basename(unquote(parsed.path))
        if not fname or len(fname) > 100:
            ext = os.path.splitext(parsed.path)[1] or ".bin"
            fname = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        fname = re.sub(r"[^\w.\-]", "_", fname)
        dest = dest_dir / fname
        dest.write_bytes(r.content)
        return fname
    except Exception as e:
        print(f"  [WARN] Failed to download {url}: {e}")
        return None


def extract_text_content(soup: BeautifulSoup) -> dict:
    """Extract structured text content from the main content area."""
    content_div = soup.select_one("div.component.content, div.content")
    if not content_div:
        content_div = soup

    # Remove unwanted elements
    for el in content_div.select(
        "script, style, .contact-form, .breadcrumbs, .seo-footer, "
        ".yashare-auto-init, .module-left, .module-footer"
    ):
        el.decompose()

    result = {
        "h1": "",
        "intro": "",
        "sections": [],
        "quick_links": [],
        "pdf_links": [],
        "image_alt_texts": [],
    }

    h1 = soup.find("h1")
    if h1:
        result["h1"] = h1.get_text(strip=True)

    if content_div:
        # First paragraph as intro
        p = content_div.find("p")
        if p:
            result["intro"] = p.get_text(strip=True)[:500]

        # Extract section headers and content
        for el in content_div.find_all(["h2", "h3", "h4", "p", "ul", "li"]):
            if isinstance(el, Tag):
                tag = el.name
                text = el.get_text(strip=True)
                if not text:
                    continue
                if tag in ("h2", "h3", "h4"):
                    result["sections"].append({"type": "heading", "level": tag, "text": text})
                elif tag == "p":
                    result["sections"].append({"type": "paragraph", "text": text})
                elif tag == "li":
                    result["sections"].append({"type": "list_item", "text": text})

    # Quick links
    for ql in soup.select(".quick-links a"):
        result["quick_links"].append({"text": ql.get_text(strip=True), "href": ql.get("href", "")})

    # PDF links
    for a in soup.find_all("a", href=re.compile(r"\.pdf$", re.I)):
        href = urljoin(BASE_URL, a.get("href", ""))
        result["pdf_links"].append({"text": a.get_text(strip=True), "url": href})

    # Image alt texts
    for img in soup.find_all("img"):
        alt = img.get("alt", "").strip()
        if alt:
            src = urljoin(BASE_URL, img.get("src", ""))
            result["image_alt_texts"].append({"alt": alt, "src": src})

    return result


def extract_meta(soup: BeautifulSoup) -> dict:
    meta = {
        "title": "",
        "description": "",
        "keywords": "",
        "generator": "",
    }
    t = soup.find("title")
    if t:
        meta["title"] = t.get_text(strip=True)
    for name in ["description", "keywords", "generator"]:
        tag = soup.find("meta", attrs={"name": name})
        if tag:
            meta[name] = tag.get("content", "")
    return meta


def parse_sitemap() -> list[dict]:
    print(f"[*] Fetching sitemap: {SITEMAP_URL}")
    r = requests.get(SITEMAP_URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    root = ET.fromstring(r.content)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = []
    for url in root.findall("s:url", ns):
        loc = url.find("s:loc", ns)
        priority = url.find("s:priority", ns)
        if loc is not None:
            urls.append({
                "url": loc.text.strip(),
                "priority": float(priority.text) if priority is not None else 0.5,
            })
    print(f"[*] Found {len(urls)} URLs in sitemap")
    return urls


def is_downloadable(url: str) -> bool:
    parsed = urlparse(url)
    path = parsed.path.lower()
    return any(path.endswith(ext) for ext in [".pdf", ".gif", ".png", ".jpg", ".jpeg", ".svg"])


def categorize_url(url: str) -> str:
    """Categorize URL as html, pdf, image, or other."""
    parsed = urlparse(url)
    path = parsed.path.lower()
    if path.endswith(".pdf"):
        return "pdf"
    if path.endswith((".gif", ".png", ".jpg", ".jpeg", ".svg")):
        return "image"
    if path.endswith(".html") or not os.path.splitext(path)[1]:
        return "html"
    return "other"


def is_same_domain(url: str) -> bool:
    """Check if URL belongs to the target domain (handles www vs non-www)."""
    domain = urlparse(url).netloc.lower().replace("www.", "")
    target = urlparse(BASE_URL).netloc.lower().replace("www.", "")
    return domain == target


def extract_page_links(soup: BeautifulSoup, from_url: str) -> list[str]:
    """Extract all links to images and PDFs from a page."""
    links = set()
    for a in soup.find_all("a", href=True):
        href = urljoin(from_url, a["href"])
        if is_same_domain(href) and is_downloadable(href):
            links.add(href)
    for img in soup.find_all("img", src=True):
        src = urljoin(from_url, img["src"])
        if is_same_domain(src):
            links.add(src)
    return list(links)


def save_page_as_markdown(url: str, html: str, meta: dict, content: dict):
    """Save parsed page as a Markdown file."""
    fname = safe_filename(url) + ".md"
    fpath = PAGES_DIR / fname
    fpath.parent.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append(f"# {meta['title']}")
    lines.append(f"")
    lines.append(f"> URL: {url}")
    lines.append(f"> Description: {meta['description']}")
    lines.append(f"> Keywords: {meta['keywords']}")
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")

    if content["h1"]:
        lines.append(f"# {content['h1']}")
        lines.append(f"")

    if content["intro"]:
        lines.append(f"{content['intro']}")
        lines.append(f"")

    for section in content["sections"]:
        if section["type"] == "heading":
            level = int(section["level"][1])
            lines.append(f"{'#' * level} {section['text']}")
        elif section["type"] == "paragraph":
            lines.append(f"{section['text']}")
        elif section["type"] == "list_item":
            lines.append(f"- {section['text']}")
        lines.append(f"")

    if content["quick_links"]:
        lines.append(f"**Быстрые ссылки:**")
        lines.append(f"")
        for ql in content["quick_links"]:
            lines.append(f"- [{ql['text']}]({ql['href']})")
        lines.append(f"")

    if content["pdf_links"]:
        lines.append(f"**PDF-каталоги:**")
        lines.append(f"")
        for pdf in content["pdf_links"]:
            lines.append(f"- [{pdf['text']}]({pdf['url']})")
        lines.append(f"")

    fpath.write_text("\n".join(lines), encoding="utf-8")
    return fname


def main():
    ensure_dirs()
    urls = parse_sitemap()

    # Separate direct media URLs from HTML pages
    pages = [u for u in urls if categorize_url(u["url"]) == "html"]
    media = [u for u in urls if categorize_url(u["url"]) != "html"]

    index = {
        "meta": {
            "source": BASE_URL,
            "total_urls": len(urls),
            "pages": len(pages),
            "media": len(media),
        },
        "pages": [],
        "media": [],
        "unexpected": [],
    }

    seen_media = set()

    print(f"[*] Parsing {len(pages)} pages...")
    for i, entry in enumerate(pages, 1):
        url = entry["url"]
        print(f"  [{i}/{len(pages)}] {url}")
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")

            meta = extract_meta(soup)
            content = extract_text_content(soup)
            fname = save_page_as_markdown(url, r.text, meta, content)

            # Download media linked from this page
            page_media = []
            media_links = extract_page_links(soup, url)
            for murl in media_links:
                if murl in seen_media:
                    continue
                seen_media.add(murl)
                cat = categorize_url(murl)
                dest = IMAGES_DIR if cat == "image" else PDF_DIR
                subdir = "data/images" if cat == "image" else "data/pdf"
                dl = download_file(murl, dest)
                if dl:
                    page_media.append({"url": murl, "file": f"{subdir}/{dl}"})

            index["pages"].append({
                "url": url,
                "file": str(Path("data/content/pages") / fname),
                "meta": meta,
                "content": {"h1": content["h1"], "intro": content["intro"]},
                "media_links": page_media,
                "quick_links": content["quick_links"],
                "pdf_links": content["pdf_links"],
            })
            time.sleep(DELAY)
        except Exception as e:
            print(f"  [ERROR] {url}: {e}")
            index["unexpected"].append({"url": url, "error": str(e)})

    # Download standalone media from sitemap
    print(f"[*] Downloading {len(media)} standalone media files from sitemap...")
    for entry in media:
        url = entry["url"]
        if url in seen_media:
            continue
        seen_media.add(url)
        cat = categorize_url(url)
        dest = IMAGES_DIR if cat == "image" else PDF_DIR
        subdir = "data/images" if cat == "image" else "data/pdf"
        dl = download_file(url, dest)
        if dl:
            index["media"].append({"url": url, "file": f"{subdir}/{dl}"})
            print(f"  [OK] {url} -> {subdir}/{dl}")
            time.sleep(DELAY)

    # Second pass: scan all saved pages for any missed media URLs (from links in content)
    print(f"[*] Second pass: scanning markdown for missed media...")
    for md_file in PAGES_DIR.rglob("*.md"):
        text = md_file.read_text(encoding="utf-8")
        for m in re.findall(r"https?://[^\s)'\"<>]+(?:\.(?:pdf|gif|png|jpe?g|svg))(?:\?[^\s)]*)?", text, re.I):
            murl = m.strip(").,;:\"'")
            if murl in seen_media:
                continue
            seen_media.add(murl)
            if is_same_domain(murl) and is_downloadable(murl):
                cat = categorize_url(murl)
                dest = IMAGES_DIR if cat == "image" else PDF_DIR
                subdir = "data/images" if cat == "image" else "data/pdf"
                dl = download_file(murl, dest)
                if dl:
                    index["media"].append({"url": murl, "file": f"{subdir}/{dl}"})
                    print(f"  [MEDIA] {murl}")
                    time.sleep(DELAY)

    # Save index
    index_path = DATA_DIR / "index.json"
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[DONE] Index saved: {index_path}")
    print(f"  Pages parsed: {len(index['pages'])}")
    print(f"  Media downloaded (standalone): {len(index['media'])}")
    print(f"  Media downloaded (from pages): {sum(len(p['media_links']) for p in index['pages'])}")
    print(f"  Errors: {len(index['unexpected'])}")

    # Generate YAML structure file
    try:
        import yaml
        struct_path = DATA_DIR / "structure.yaml"
        structure = {"source": BASE_URL, "pages": []}
        for p in index["pages"]:
            structure["pages"].append({"url": p["url"], "meta": p["meta"]})
        struct_path.write_text(yaml.dump(structure, allow_unicode=True, default_flow_style=False), encoding="utf-8")
        print(f"  Structure: {struct_path}")
    except ImportError:
        pass


if __name__ == "__main__":
    main()
