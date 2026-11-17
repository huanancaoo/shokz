"""Capture the public Korean catalog and editorial content used by the POC."""

import hashlib
import json
import re
import runpy
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from io import BytesIO
from PIL import Image
from source_content import product_story, specifications as extract_specs, faq_items, paragraphs as extract_paragraphs, section_media

from bs4 import BeautifulSoup

BACKEND = Path(__file__).resolve().parent.parent
ROOT = BACKEND.parent.parent
DATA = BACKEND / "data"
CACHE = ROOT / ".scratch/source"
ASSETS = DATA / "assets"
CONTENT = DATA / "content"
BASE = "https://shokz.co.kr"
manifest = json.loads((DATA / "asset-manifest.json").read_text()) if (DATA / "asset-manifest.json").exists() else {}


def fetch(url, data=None, user_agent="Mozilla/5.0"):
    url = urllib.parse.quote(url, safe=":/?=&%+#@")
    headers = {"User-Agent": user_agent}
    if data is not None:
        headers["Content-Type"] = "application/json"
    request = urllib.request.Request(
        url,
        data=json.dumps(data).encode() if data is not None else None,
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        return response.read()


def dimensions(local):
    target = ASSETS / local.rsplit("/", 1)[-1]
    try:
        with Image.open(target) as image:
            return image.size
    except (OSError, ValueError):
        return None


def asset(url):
    url = urllib.parse.urljoin(BASE, url)
    suffix = Path(urllib.parse.urlparse(url).path).suffix.lower()
    if suffix and suffix not in [".png", ".jpg", ".jpeg", ".webp", ".svg", ".avif", ".gif", ".mp4"]:
        return None
    digest = hashlib.sha256(url.encode()).hexdigest()[:18]
    existing = list(ASSETS.glob(digest + ".*"))
    target = existing[0] if existing else ASSETS / (digest + (suffix or ".webp"))
    content = target.read_bytes() if target.exists() else fetch(url)
    if not suffix and b"ftyp" in content[:64]:
        suffix = ".mp4"
        target = ASSETS / (digest + suffix)
    if suffix not in [".mp4", ".svg"]:
        try:
            with Image.open(BytesIO(content)) as image:
                if not suffix:
                    suffix = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp", "GIF": ".gif", "AVIF": ".avif"}[image.format]
                    target = ASSETS / (digest + suffix)
                image.verify()
        except (OSError, ValueError):
            return None
    elif suffix == ".svg" and b"<svg" not in content[:4096]:
        return None
    target.write_bytes(content)
    local = "/shokz/" + target.name
    manifest[local] = url
    return local


def image_urls(soup, limit):
    urls = []
    for element in soup.select("img"):
        url = element.get("data-src") or element.get("data-original") or element.get("src", "")
        if not url or any(word in url.lower() for word in ["icon", "logo", "loading", "arrow", "btn", "pixel", "blank"]):
            continue
        if element.get("width", "") in ["1", "16", "20", "24", "32"]:
            continue
        absolute = urllib.parse.urljoin(BASE, url)
        if absolute not in urls and re.search(r"\.(?:webp|png|jpg|jpeg|avif)(?:\?|$)", absolute, re.I):
            urls.append(absolute)
        if len(urls) == limit:
            break
    return urls


def parse_product(card, category_map):
    pid = card["it_id"]
    raw = json.loads((CACHE / ("item-" + pid + ".json")).read_text())["data"]["productData"]
    soup = BeautifulSoup((CACHE / ("item-" + pid + ".html")).read_text(), "html.parser")
    html = str(soup)
    match = re.search(r"var item_product\s*=\s*", html)
    fields = json.JSONDecoder().raw_decode(html[match.end():])[0] if match else {}
    structured = []
    for node in soup.select('script[type="application/ld+json"]'):
        try:
            parsed = json.loads(node.string or "{}")
            structured.extend(parsed.get("@graph", [parsed]))
        except json.JSONDecodeError:
            continue
    product_schema = next((node for node in structured if node.get("@type") == "Product"), {})
    faq = []
    for node in structured:
        if node.get("@type") == "FAQPage":
            for question in node.get("mainEntity", []):
                faq.append({"question": question["name"], "answer": question["acceptedAnswer"]["text"]})
    for subject in product_schema.get("subjectOf", []):
        for question in subject.get("mainEntity", []):
            faq.append({"question": question["name"], "answer": question["acceptedAnswer"]["text"]})
    options = raw["optionData"].get("option", {})
    specs = options.get("spec", [])
    variants = []
    all_images = []
    for sku in options.get("sku", []):
        if str(sku.get("io_use")) != "1":
            continue
        images = []
        gallery_video = None
        for group in sku.get("image_gp", []):
            if group["type"] == "picture":
                images += group["asset"]
            elif group["type"] == "video" and group["asset"]:
                url = group["asset"][0].strip()
                gallery_video = url if "youtube.com/embed/" in url else asset(url)
        card_sku = next((item for item in card["skus"] if str(item["io_no"]) == str(sku["io_no"])), None)
        if card_sku and card_sku.get("image"):
            images.insert(0, card_sku["image"])
        local_images = list(dict.fromkeys(asset(url) for url in images))
        local_images = [url for url in local_images if url]
        local_images.sort(key=lambda url: max(dimensions(url) or (0, 0)), reverse=True)
        all_images += local_images
        values = sku["io_id"].split("\u001e")
        variant_options = {spec["sp_name"]: values[index] for index, spec in enumerate(specs)}
        variants.append({
            "title": " / ".join(value for value in values if value) or card["it_name"],
            "sku": sku.get("io_PROD_CD") or pid + "-" + str(sku["io_no"]),
            "options": variant_options,
            # POC stock is deliberately independent of the source merchant's stock.
            "inventory_quantity": 20 if int(sku.get("io_stock_qty", 0)) > 0 else 0,
            "price": int(sku.get("price") or card["it_price"]),
            "images": local_images,
            "video": gallery_video,
        })
    if not variants:
        raise ValueError("No purchasable variants in public data: " + pid)
    thumbnail = asset(card["it_spu_image"]) if card["it_spu_image"] else all_images[0]
    if not thumbnail:
        raise ValueError("Missing product image: " + pid)
    all_images = list(dict.fromkeys([thumbnail] + all_images))
    story = product_story(soup, BASE + "/shop/" + pid, asset, dimensions)
    videos = list(dict.fromkeys(url for block in story for url in block["videos"]))
    detail_images = [item["src"] for block in story for item in block["media"]]
    size_video = re.search(r'data-size-video-id=["\x27]([A-Za-z0-9_-]+)', html) if pid == "openrun-air-2" else None
    details = raw["itemData"]
    features = details.get("it_info_value", {})
    if isinstance(features, list):
        features = {}
    feature_names = {"it_proswim": "수영용", "it_wireless": "무선 충전", "it_EQ": "개인화 EQ", "it_dolby": "Dolby Audio", "it_connect": "멀티포인트", "it_MP3": "MP3 내장 메모리", "it_swim": "IP55 이상 방수"}
    specification_fields = {"it_technology": "오디오 기술", "it_waterproof": "방수 등급", "it_bluetooth": "블루투스", "it_material": "소재", "it_battery": "배터리", "it_microphone": "마이크", "it_memory": "내장 메모리", "it_model": "모델"}
    specifications = {label: fields[key] for key, label in specification_fields.items() if fields.get(key)}
    specifications.update(extract_specs(soup))
    faq += [item for item in faq_items(soup) if item not in faq]
    faq_by_question = {}
    for item in faq:
        question = BeautifulSoup(item["question"], "html.parser").get_text(" ", strip=True)
        answer = BeautifulSoup(item["answer"], "html.parser").get_text(" ", strip=True)
        faq_by_question.setdefault(question, {"question": question, "answer": answer})
    faq = list(faq_by_question.values())
    comparison = {"제품 유형": {"sports": "스포츠", "lifestyle": "라이프스타일", "communication": "커뮤니케이션", "accessories": "액세서리"}[category_map[pid]]}
    labels = {"오디오 기술": "오디오 기술", "스피커 종류": "오디오 기술", "방수 등급": "방수 등급", "방수 및 방진 등급": "방수 등급", "블루투스® 버전": "블루투스", "블루투스 버전": "블루투스", "블루투스": "블루투스", "연속 재생 시간": "재생 시간", "배터리 시간": "재생 시간", "배터리 수명": "재생 시간", "무게": "무게", "중량": "무게", "충전 시간": "충전 시간", "내장 메모리": "내장 메모리", "보증 기간": "보증 기간"}
    for key, label in labels.items():
        if specifications.get(key):
            comparison[label] = re.split(r"메모:|참고:", specifications[key])[0].strip()
    feature_labels = {"it_batterylife": "케이스 포함 재생 시간", "it_watertproof": "방수 등급", "it_weight": "무게", "it_dolby": "돌비 오디오", "it_noisereduct": "노이즈 리덕션"}
    for key, label in feature_labels.items():
        value = features.get(key)
        if value and str(value) not in ["0", "1"]:
            specifications[label] = str(value)
            comparison[label] = str(value)
    for item in card.get("features", []):
        label = feature_labels.get(item["code"])
        if label:
            specifications[label] = item["label"]
            comparison[label] = item["label"]
    canonical = {"OpenRunPro2": "openrun-pro2", "OpenSwimPro": "openswim-pro", "1633507126": "openmove"}.get(pid, pid.lower())
    return {
        "source_id": pid,
        "handle": canonical,
        "title": card["it_name"],
        "subtitle": details.get("it_model", "SHOKZ"),
        "description": details.get("it_basic", "") if category_map[pid] == "accessories" else soup.select_one('meta[name="description"]').get("content", ""),
        "category": category_map[pid],
        "thumbnail": thumbnail,
        "images": all_images,
        "options": [{"title": s["sp_name"], "values": [v["sv_name"] for v in s["sp_value"] if v.get("sv_use", 1)]} for s in specs],
        "variants": variants,
        "metadata": {
            "source_url": BASE + "/shop/" + pid,
            "badge": card.get("badge", []),
            "rating": card.get("rating", {}),
            "features": [name for key, name in feature_names.items() if str(features.get(key)) == "1"],
            "specifications": specifications,
            "story": story,
            "comparison": comparison,
            "comparable": category_map[pid] != "accessories",
            "videos": [url for url in videos if url],
            "size_guide_video": "https://www.youtube.com/embed/" + size_video[1] if size_video else None,
            "swatches": {v["sv_name"]: v.get("colors", []) for s in specs if s["sp_type"] == "color" for v in s["sp_value"]},
            "faq": faq,
            "detail_images": [x for x in detail_images if x and x != thumbnail],
        },
    }


def capture_page(title, path, slug, kind="editorial"):
    target = CACHE / ("page-" + slug + ".html")
    if not target.exists():
        target.write_bytes(fetch(urllib.parse.urljoin(BASE, path)))
    soup = BeautifulSoup(target.read_text(), "html.parser")
    scope = soup.select_one("#container") or soup.select_one("main") or soup.body
    for node in scope.select("script,style,nav,header,footer,form,noscript"):
        node.decompose()
    media = section_media(scope, BASE + path, asset, dimensions)
    images = [item["src"] for item in media]
    paragraphs = extract_paragraphs(scope)
    headings = list(dict.fromkeys(node.get_text(" ", strip=True) for node in scope.select("h1,h2,h3,h4")))
    links = [{"title": link.get_text(" ", strip=True), "href": urllib.parse.urljoin(BASE + path, link["href"])} for link in scope.select("a[href]") if link.get_text(strip=True) and not link["href"].startswith("javascript:")]
    tables = [[[cell.get_text(" ", strip=True) for cell in row.find_all(["th", "td"], recursive=False)] for row in table.select("tr")] for table in scope.select("table")]
    return {"slug": slug, "title": title, "source_url": BASE + path, "kind": kind, "images": images, "media": media, "paragraphs": paragraphs, "headings": headings, "links": links, "tables": tables}



def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    CONTENT.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    if not (CACHE / "home.html").exists():
        (CACHE / "home.html").write_bytes(fetch(BASE))
    if not (CACHE / "home-mobile.html").exists():
        (CACHE / "home-mobile.html").write_bytes(fetch(BASE, user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"))
    if not (CACHE / "products-list.json").exists():
        cards = []
        for page in [1, 2]:
            cards += json.loads(fetch(BASE + "/sdk/collection.php?act=product-list&per_page=12&device=pc&page=" + str(page)))["data"]["products"]
        (CACHE / "products-list.json").write_text(json.dumps(cards, ensure_ascii=False))
    cards = json.loads((CACHE / "products-list.json").read_text())
    for card in cards:
        pid = card["it_id"]
        html_path = CACHE / ("item-" + pid + ".html")
        api_path = CACHE / ("item-" + pid + ".json")
        if not html_path.exists():
            html_path.write_bytes(fetch(BASE + "/shop/" + pid))
        if not api_path.exists():
            api_path.write_bytes(fetch(BASE + "/sections/ajax.listing.php", {"act": "product-info", "it_id": pid, "device": "pc", "version": 1.0, "release": 1}))
    category_map = {}
    categories = [("30", "sports", "스포츠"), ("j0", "lifestyle", "라이프스타일"), ("k0", "communication", "커뮤니케이션"), ("c0", "accessories", "액세서리")]
    for ca_id, handle, title in categories:
        data = json.loads(fetch(BASE + "/sdk/collection.php?act=product-list&ca_id=" + ca_id + "&per_page=12&device=pc"))["data"]
        for product in data["products"]:
            category_map[product["it_id"]] = handle
    with ThreadPoolExecutor(max_workers=4) as pool:
        products = list(pool.map(lambda card: parse_product(card, category_map), cards))
    catalog = {"captured_at": datetime.now(timezone.utc).isoformat(), "source": BASE + "/shop/all", "categories": [{"handle": handle, "name": name} for _, handle, name in categories], "products": products}
    (DATA / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2))
    targets = [
        ("샥즈의 기술", "/pages/technology", "technology"),
        ("골전도 기술", "/pages/bone-conduction-technology", "bone-conduction-technology"),
        ("Shokz OpenSound", "/pages/shokz-opensound", "shokz-opensound"),
        ("오픈이어 오디오", "/pages/open-ear-audio-technology", "open-ear-audio-technology"),
        ("컴포트 기술", "/pages/comfort-tech", "comfort-tech"),
        ("스포츠 기술", "/pages/sports-tech", "sports-tech"),
        ("브랜드 앰버서더", "/pages/ambassador", "ambassador"),
        ("샥즈 애슬리트", "/athlete/", "athletes"),
        ("오픈이어란", "/pages/explore-open-ear-earphones", "open-ear-guide"),
        ("일상 속 오픈이어", "/pages/explore-open-ear-earphones-for-lifestyle", "lifestyle-guide"),
        ("러닝과 함께", "/pages/open-ear-earphones-for-running", "running-guide"),
        ("샥즈 멤버십", "/bbs/point_new.php", "membership", "membership"),
        ("사용 후기", "/shop/itemuselist.php", "reviews", "display"),
        ("매장 찾기", "/pages/brand-store.php", "stores"),
        ("A/S 신청 안내", "/cs/afterservice.php", "support", "display"),
        ("자주 묻는 질문", "/productFaq", "faq"),
        ("정품 등록", "/certified", "registration", "display"),
        ("비즈니스", "/b2b", "business", "display"),
        ("개인정보처리방침", "/content/privacy", "privacy"),
        ("이용약관", "/content/provision", "terms"),
        ("품질 보증 안내", "/blog/notify/warranty-service-policy", "warranty"),
    ]
    with ThreadPoolExecutor(max_workers=4) as pool:
        pages = list(pool.map(lambda entry: capture_page(*entry), targets))
    articles = []
    for section in ["News", "Guide", "Event", "Magazine", "Interview"]:
        soup = BeautifulSoup(fetch(BASE + "/blog?sca=" + section), "html.parser")
        links = {}
        for link in soup.select('#container a[href*="/blog/"]'):
            path = urllib.parse.urlparse(urllib.parse.urljoin(BASE, link["href"])).path
            if path in ["/blog/" + section, "/blog/"] or not link.get_text(strip=True):
                continue
            links.setdefault(path, link.get_text(" ", strip=True))
        for index, (path, title) in enumerate(list(links.items())):
            article = capture_page(title[:100], path, section + "-" + str(index + 1), "article")
            article["category"] = section.lower()
            articles.append(article)
    (CONTENT / "pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2))
    (CONTENT / "articles.json").write_text(json.dumps(articles, ensure_ascii=False, indent=2))
    (DATA / "asset-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    runpy.run_path(str(BACKEND / "scripts/import-home.py"), run_name="__main__")
    print(json.dumps({"products": len(products), "variants": sum(len(p["variants"]) for p in products), "pages": len(pages), "articles": len(articles), "assets": len(manifest)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
