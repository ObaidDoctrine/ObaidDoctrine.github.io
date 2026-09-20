from bs4 import BeautifulSoup
from pathlib import Path
import re

articles = sorted(Path("ur/articles").glob("*/index.html"))

for path in articles:
    slug = path.parent.name
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    article = soup.select_one("main article")
    if not article:
        print(f"SKIP {slug}: article container not found")
        continue

    for node in article.select(".source-box, nav, script, style, .listen-to-article"):
        node.decompose()

    parts = []
    for el in article.select("h1,h2,h3,h4,p,blockquote,li"):
        text = el.get_text(" ", strip=True)
        if not text:
            continue
        if text.strip() == "مزید پڑھیں":
            break
        text = re.sub(r"\s+", " ", text).strip()
        parts.append(text)

    out = Path("audio/ur") / f"{slug}.txt"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(parts) + "\n", encoding="utf-8")
    print(f"{slug}: {len(parts)} blocks, {sum(map(len, parts))} characters")
