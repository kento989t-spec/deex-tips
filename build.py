#!/usr/bin/env python3
"""tips.md → tips.json 変換スクリプト"""
import json
import re
import sys
from pathlib import Path

TIPS_MD = Path.home() / ".company" / "operations" / "tips.md"
OUT_DIR = Path(__file__).parent / "docs"


def parse_tips(md_text: str) -> list[dict]:
    sections = re.split(r"^## ", md_text, flags=re.MULTILINE)[1:]
    tips = []
    for section in sections:
        lines = section.strip().split("\n")
        title = lines[0].strip()
        tags = []
        content_start = 1
        for i, line in enumerate(lines[1:], 1):
            if line.strip().startswith("tags:"):
                tags = [t.strip() for t in line.replace("tags:", "").split(",")]
                content_start = i + 1
                break
            elif line.strip():
                content_start = i
                break
        content = "\n".join(lines[content_start:]).strip()
        tips.append({"title": title, "tags": tags, "content": content})
    return tips


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else TIPS_MD
    if not src.exists():
        print(f"Error: {src} not found")
        sys.exit(1)

    OUT_DIR.mkdir(exist_ok=True)
    tips = parse_tips(src.read_text(encoding="utf-8"))
    (OUT_DIR / "tips.json").write_text(
        json.dumps(tips, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Generated {len(tips)} tips → docs/tips.json")


if __name__ == "__main__":
    main()
