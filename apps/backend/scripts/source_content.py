"""Extract editorial content without copying scripts, tracking, or page controls."""

import re
import urllib.parse
from bs4 import BeautifulSoup

CONTROL_WORDS = re.compile(r"(?:^|[-_/])(icon|arrow|prev|next|close|loading|btn|button|play|pause|logo)(?:[-_.?/]|$)", re.I)
EXCLUDED = re.compile(r"review|sit_use|sit_rel|disclaimer|attention|spec|faq|(?:^|-)c[345](?:$|-)", re.I)


def clean_text(node):
    clone = BeautifulSoup(str(node), "html.parser")
    for item in clone.select("script,style,noscript,svg,sup"):
        item.decompose()
    return re.sub(r"\s+", " ", clone.get_text(" ", strip=True)).strip()


def paragraphs(scope):
    clone = BeautifulSoup(str(scope), "html.parser")
    for item in clone.select("script,style,noscript,svg,button,nav,form,header,footer"):
        item.decompose()
    result = []
    for text in clone.stripped_strings:
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) >= 3 and text not in result and text not in ["작게", "기본", "크게", "No athletes found."]:
            result.append(text)
    return result


def media_candidates(scope, page_url):
    result = []
    for image in scope.select("img"):
        url = image.get("data-src") or image.get("data-original") or image.get("src", "")
        picture = image.find_parent("picture")
        if picture:
            sources = picture.select("source[srcset]")
            desktop = [source for source in sources if "min-width" in source.get("media", "")]
            if desktop:
                url = desktop[0]["srcset"].split(",")[0].split(" ")[0]
        label = " ".join(image.get("class", [])) + "/" + url
        if url and not CONTROL_WORDS.search(label):
            absolute = urllib.parse.urljoin(page_url, url)
            if absolute not in result:
                result.append(absolute)
    for node in scope.select("[style], style"):
        css = node.get("style", "") if node.name != "style" else node.get_text()
        for url in re.findall(r"url\(['\"]?([^'\"\)]+)", css):
            if not CONTROL_WORDS.search(url) and not url.startswith("data:"):
                absolute = urllib.parse.urljoin(page_url, url)
                if absolute not in result:
                    result.append(absolute)
    return result


def section_media(scope, page_url, asset, dimensions):
    result = []
    for url in media_candidates(scope, page_url):
        if not re.search(r"\.(?:webp|png|jpe?g|avif|gif)(?:\?|$)", url, re.I):
            continue
        local = asset(url)
        if not local:
            continue
        size = dimensions(local)
        # 原站的轮播箭头、按钮和追踪像素不能成为产品故事图。
        if size and size[0] >= 300 and size[1] >= 200 and local not in [item["src"] for item in result]:
            result.append({"src": local, "width": size[0], "height": size[1]})
    return result


def product_story(soup, page_url, asset, dimensions):
    roots = soup.select("section.ora-section,section.ofa-section,section.lok-section,section.be-section,section.ora-l1__hero,section.ofa-l2")
    if not roots:
        legacy = soup.select_one("#sit_inf1")
        if legacy:
            roots = legacy.select(".shopify-section")
            if not roots:
                roots = [item for item in legacy.find_all(recursive=False) if item.name in ["section", "div"]]
        else:
            legacy = soup.select_one("#sit_inf_explan_new") or soup.select_one("#sit_inf_explan")
            if legacy:
                roots = [legacy]
            else:
                roots = soup.select("#sit_tab > section, #sit > section")
    result = []
    for index, scope in enumerate(roots):
        label = scope.get("id", "") + " " + " ".join(scope.get("class", []))
        if EXCLUDED.search(label):
            continue
        media = section_media(scope, page_url, asset, dimensions)
        texts = paragraphs(scope)
        heading = scope.select_one("h1,h2,h3,[class$='__headline'],[class$='__title'],.title")
        title = clean_text(heading) if heading else (texts[0] if texts else "")
        texts = [text for text in texts if text != title]
        videos = []
        for node in scope.select("video,source"):
            url = (node.get("data-src-pc") or node.get("src") or node.get("data-src", "")).strip()
            if ".mp4" in url:
                video = asset(urllib.parse.urljoin(page_url, url))
                if video and video not in videos:
                    videos.append(video)
        if not media and not texts and not videos:
            continue
        # 标题/正文保持源站语义；图像只采用已解码并确认尺寸的真实内容素材。
        result.append({"id": "story-" + str(index + 1), "title": title, "paragraphs": texts, "media": media, "videos": videos})
    return result


def specifications(soup):
    result = {}
    for table in soup.select("table"):
        if not any(word in table.get_text() for word in ["블루투스", "배터리", "방수", "스피커", "Bluetooth"]):
            continue
        for row in table.select("tr"):
            cells = row.find_all(["th", "td"], recursive=False)
            for index, cell in enumerate(cells[:-1]):
                if cell.name == "th" and cells[index + 1].name == "td":
                    key, value = clean_text(cell), clean_text(cells[index + 1])
                    if key and value:
                        result[key] = value
    for row in soup.select(".spec-table-item"):
        key, value = row.select_one(".spec-table-label"), row.select_one(".spec-table-value")
        if key and value:
            result[clean_text(key)] = clean_text(value)
    for row in soup.select("#sit_inf_detail .st-ul > li"):
        cells = row.find_all("p", recursive=False)
        if len(cells) == 2:
            result[clean_text(cells[0])] = clean_text(cells[1])
    return result


def faq_items(soup):
    result = []
    scopes = soup.select("#lok-faq,#sit_faq,#od2-c4,[id*='faq'].be-section,[id*='faq'].lok-section")
    for scope in scopes:
        for item in scope.select("details,[class*='c4__item'],.faq-item,.faq_item"):
            question = item.select_one("summary,h3,[class*='question'],[class*='__q']")
            answer = item.select_one("[class*='answer'],[class*='__a']")
            if question and answer:
                entry = {"question": clean_text(question), "answer": clean_text(answer)}
                if entry["question"] and entry["answer"] and entry not in result:
                    result.append(entry)
    return result
