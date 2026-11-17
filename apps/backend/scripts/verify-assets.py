"""Validate referenced local media, including content that has not entered the viewport."""

import json
import hashlib
import subprocess
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

BACKEND = Path(__file__).resolve().parent.parent
ROOT = BACKEND.parent.parent
ASSETS = BACKEND / "data/assets"
manifest = json.loads((BACKEND / "static/.shokz-media.json").read_text())
source_by_id = {file_id: source for source, file_id in manifest.items()}
references = set()


def collect(value, published=False):
    if isinstance(value, str):
        if value.startswith("/shokz/"):
            assert not published, "Storefront still uses a relative media URL: " + value
            references.add(value)
        elif value.startswith("http://localhost:9001/static/"):
            file_id = urllib.parse.unquote(urllib.parse.urlparse(value).path.removeprefix("/static/"))
            references.add(source_by_id[file_id])
    elif isinstance(value, dict):
        for item in value.values():
            collect(item, published)
    elif isinstance(value, list):
        for item in value:
            collect(item, published)


for source in [BACKEND / "data/catalog.json", *sorted((BACKEND / "data/content").glob("*.json"))]:
    collect(json.loads(source.read_text()))
for source in sorted((ROOT / "apps/storefront/src/content").glob("*.json")):
    collect(json.loads(source.read_text()), published=True)
assert not (ROOT / "apps/storefront/public/shokz").exists()


def validate(reference):
    target = ASSETS / reference.rsplit("/", 1)[-1]
    if target.suffix.lower() in [".mp4", ".webm"]:
        result = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(target)], check=True, capture_output=True, text=True)
        assert float(json.loads(result.stdout)["format"]["duration"]) > 0, reference
    elif target.suffix.lower() == ".svg":
        assert ET.parse(target).getroot().tag.endswith("svg"), reference
    else:
        with Image.open(target) as image:
            image.verify()
    url = "http://localhost:9001/static/" + manifest[reference]
    with urllib.request.urlopen(url, timeout=30) as response:
        assert response.status == 200, url
        assert hashlib.sha256(response.read()).digest() == hashlib.sha256(target.read_bytes()).digest(), url
    return reference


with ThreadPoolExecutor(max_workers=4) as pool:
    checked = list(pool.map(validate, sorted(references)))

directory = ROOT / ".scratch/verification"
directory.mkdir(parents=True, exist_ok=True)
report = {"referenced_media": len(checked), "http_and_bytes": "passed", "storefront_relative_media": 0, "storefront_asset_directory_removed": True, "result": "passed"}
(directory / "asset-report.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))
