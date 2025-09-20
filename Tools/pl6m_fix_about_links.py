# -*- coding: utf-8 -*-
"""
PL-6m – Fix EU links in About/Chi siamo pages
Aggiorna i link "Digital Education Action Plan" e "Funding programmes"
con URL stabili della Commissione Europea.
"""

from pathlib import Path

PATCHES = {
    "webapp/app/en/about/page.tsx": [
        (
            "Digital Education Action Plan 2021–2027",
            "https://digital-strategy.ec.europa.eu/en/policies/digital-education-action-plan",
        ),
        (
            "European funding programmes",
            "https://commission.europa.eu/funding-tenders/find-funding_en",
        ),
        (
            "ERDF",
            "https://regional-policy.ec.europa.eu/funding/erdf_en",
        ),
    ],
    "webapp/app/it/chi-siamo/page.tsx": [
        (
            "Digital Education Action Plan 2021–2027",
            "https://digital-strategy.ec.europa.eu/it/policies/digital-education-action-plan",
        ),
        (
            "programmi di finanziamento UE",
            "https://commission.europa.eu/funding-tenders/find-funding_en",
        ),
        (
            "FESR (ERDF)",
            "https://regional-policy.ec.europa.eu/funding/erdf_en",
        ),
    ],
}

def patch_file(path: Path, rules):
    text = path.read_text(encoding="utf-8")
    for label, url in rules:
        # cerca <a ...>{label}</a> e sostituisci href
        import re
        text = re.sub(
            rf'(<a[^>]+href=")[^"]+("[^>]*>{label}</a>)',
            rf'\1{url}\2',
            text,
        )
    path.write_text(text, encoding="utf-8")
    print(f"[OK] Patch applicata a {path}")

def main():
    root = Path(".")
    for rel, rules in PATCHES.items():
        path = root / rel
        if path.exists():
            patch_file(path, rules)
        else:
            print(f"[WARN] File non trovato: {rel}")

if __name__ == "__main__":
    main()
