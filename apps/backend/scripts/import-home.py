"""Capture the public homepage campaigns and product discovery configuration."""

import json
import re
import runpy
import subprocess
import sys
import urllib.parse
from pathlib import Path
from bs4 import BeautifulSoup

BACKEND = Path(__file__).resolve().parent.parent
ROOT = BACKEND.parent.parent
DATA = BACKEND / "data"
sys.path.insert(0, str(BACKEND / "scripts"))
source = runpy.run_path(str(BACKEND / "scripts/import-source.py"), run_name="source_helpers")
asset, fetch = source["asset"], source["fetch"]
cache = ROOT / ".scratch/source"
html = (cache / "home.html").read_text()
soup = BeautifulSoup(html, "html.parser")
mobile = BeautifulSoup((cache / "home-mobile.html").read_text(), "html.parser")
data = {}
for match in re.finditer(r"(?:window\.)?([A-Z_][A-Z0-9_]*)\s*=\s*([\[{])", html):
    try:
        data[match[1]] = json.JSONDecoder().raw_decode(html[match.start(2):])[0]
    except (ValueError, TypeError):
        continue
catalog = json.loads((DATA / "catalog.json").read_text())
handles = {product["source_id"]: product["handle"] for product in catalog["products"]}
handles.update({product["handle"]: product["handle"] for product in catalog["products"]})


def local_link(url):
    path = urllib.parse.urlparse(url).path
    if path.startswith("/shop/"):
        source_id = path.rsplit("/", 1)[-1]
        return "/products/" + handles[source_id]
    return path


def campaign_media(node):
    video = node.select_one("video")
    if video:
        return {"video": asset(video.get("data-src") or video["src"])}
    image = next(item for item in node.select("[style]") if "background-image" in item.get("style", ""))
    url = re.search(r"url\(['\"]?([^'\"\)]+)", image["style"])[1]
    return {"image": asset(url)}


desktop_slides = soup.select("#main_visual .swiper-slide")
mobile_slides = mobile.select("#main_visual .swiper-slide")
if not mobile_slides:
    mobile_slides = [node for node in mobile.select(".swiper-slide") if node.select_one('video[data-src*="/mainslide/"],[style*="/mainslide/"]')]
campaigns = []
for index, node in enumerate(desktop_slides):
    desktop = campaign_media(node)
    mobile_media = campaign_media(mobile_slides[index])
    href = local_link(node.select_one("a[href]")["href"])
    if "video" in desktop:
        video_path = source["ASSETS"] / desktop["video"].rsplit("/", 1)[-1]
        poster_path = video_path.with_suffix(".jpg")
        if not poster_path.exists():
            subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(video_path), "-frames:v", "1", "-update", "1", str(poster_path)], check=True)
        poster = "/shokz/" + poster_path.name
        title = "지창욱 × SHOKZ"
    else:
        poster = desktop["image"]
        handle = href.rsplit("/", 1)[-1]
        title = next(product["title"] for product in catalog["products"] if product["handle"] == handle)
    campaigns.append({"title": title, "href": href, "desktop": desktop, "mobile": mobile_media, "poster": poster})
# 城市跑者主视觉优先，全部原站活动入口仍可从轮播访问。
campaigns = [campaigns[1], campaigns[0], campaigns[2]]

lineup = []
for tab in data["HOME_BEST_DATA"]["tabs"]:
    products = tab["products"]
    if not products:
        response = json.loads(fetch("https://shokz.co.kr/ajax/get_home_product.php", {"ca_id": tab["type_id"]}))
        products = response["data"]["products"]
    cards = []
    for product in products:
        home = product["home_list"]
        cards.append({"handle": handles[product["it_id"]], "scene": asset(home["img_a_pc"]), "mobile_scene": asset(home["img_a_m"]), "description": home["home_desc"], "english_name": home.get("it_name_en", "")})
    lineup.append({"id": tab["type_id"], "name": tab["name"], "cards": cards})

why = data["HOME_WHY_DATA"]
benefit_links = {"member": "/pages/membership", "delivery": "/shipping", "genuine": "/pages/registration", "as": "/pages/support", "tradein": "/pages/warranty"}
benefits = [{"id": card["id"], "title": card["title"], "description": card["desc"], "image": asset(card["icon"]), "href": benefit_links[card["id"]]} for card in why["cards"] if card["enabled"]]

athletes = []
for image in soup.select(".sn-athlete-photo"):
    parent = image.parent
    index = parent.get("data-index")
    tab = soup.select_one('.sn-athlete-chip[data-index="' + index + '"]')
    avatar = tab.select_one("img")
    role = tab.select_one(".sn-athlete-meta > span")
    athletes.append({"id": index, "name": image["alt"], "image": asset(image["src"]), "avatar": asset(avatar["src"]), "role": role.get_text(" ", strip=True), "group": parent.get("data-group", "athlete")})
awards = [asset(image["src"]) for image in soup.select(".sn-awards-card img")]

reviews = []
for node in soup.select(".sn-reviews-banner,.sn-reviews-card"):
    image = node.select_one(".sn-reviews-cover,.sn-reviews-banner-img")
    if not image:
        continue
    href = node.get("data-home-product-url")
    if not href:
        link = node.select_one('a[href*="/shop/"]')
        href = link["href"] if link else ""
    if not href:
        continue
    quote = node.select_one(".sn-reviews-quote")
    author = node.select_one(".sn-reviews-user")
    reviews.append({"image": asset(image["src"]), "href": local_link(href), "quote": quote.get_text(" ", strip=True) if quote else "", "author": author.get_text(" ", strip=True) if author else ""})

quiz = data["HOME_QUIZ_DATA"]
for scene in quiz["scenes"]:
    scene["image"] = asset(scene["image"])
for product_id, product in quiz["products"].items():
    product["handle"] = handles[product_id]
    product["img"] = asset(product["img"])
    product["link"] = "/products/" + handles[product_id]
for branch in quiz["branches"].values():
    if branch.get("products"):
        branch["products"] = [handles[pid] for pid in branch["products"]]
    for option in branch.get("options", []):
        option["products"] = [handles[pid] for pid in option["products"]]
quiz["products"] = {product["handle"]: product for product in quiz["products"].values()}

home = {
    "campaigns": campaigns,
    "lineup": lineup,
    "benefits": benefits,
    "athletes": athletes,
    "awards": [url for url in awards if url],
    "reviews": reviews,
    "quiz": quiz,
    "logo": asset("https://static.shokz.co.kr/resource/2025/11/12/m-logo_6913a762744a8.png"),
}
(DATA / "content/home.json").write_text(json.dumps(home, ensure_ascii=False, indent=2))
branding = {"logo": asset("https://static.shokz.co.kr/resource/2026/10/29/alogo_6ae30024ab60e.png")}
(DATA / "content/branding.json").write_text(json.dumps(branding, ensure_ascii=False, indent=2))
(DATA / "asset-manifest.json").write_text(json.dumps(source["manifest"], ensure_ascii=False, indent=2))
print(json.dumps({"campaigns": len(campaigns), "lineup": [len(tab["cards"]) for tab in lineup], "athletes": len(athletes), "reviews": len(reviews)}, ensure_ascii=False))
