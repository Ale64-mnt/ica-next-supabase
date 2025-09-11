# -*- coding: utf-8 -*-
import json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "webapp" / "messages"
ROOT.mkdir(parents=True, exist_ok=True)

# Contenuti minimi per home in 5 lingue
DATA = {
    "it": {
        "home": {
            "title": "Educazione finanziaria, digitale ed etica",
            "intro": "Skeleton Next.js + Supabase + i18n pronto per partire.",
            "ctaNews": "Vai alle news",
            "ctaArticles": "Leggi gli articoli"
        }
    },
    "en": {
        "home": {
            "title": "Financial, digital and ethical education",
            "intro": "Skeleton Next.js + Supabase + i18n ready to go.",
            "ctaNews": "Go to news",
            "ctaArticles": "Read articles"
        }
    },
    "fr": {
        "home": {
            "title": "Éducation financière, numérique et éthique",
            "intro": "Skeleton Next.js + Supabase + i18n prêt à démarrer.",
            "ctaNews": "Voir les actualités",
            "ctaArticles": "Lire les articles"
        }
    },
    "es": {
        "home": {
            "title": "Educación financiera, digital y ética",
            "intro": "Skeleton Next.js + Supabase + i18n listo para empezar.",
            "ctaNews": "Ir a noticias",
            "ctaArticles": "Leer artículos"
        }
    },
    "de": {
        "home": {
            "title": "Finanzielle, digitale und ethische Bildung",
            "intro": "Skeleton Next.js + Supabase + i18n startklar.",
            "ctaNews": "Zu den News",
            "ctaArticles": "Artikel lesen"
        }
    },
}

def deep_merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict):
            dst[k] = deep_merge(dst.get(k, {}), v)
        else:
            dst[k] = v
    return dst

def write_locale(loc):
    path = ROOT / f"{loc}.json"
    base = {}
    if path.exists():
        try:
            base = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            base = {}
    merged = deep_merge(base, DATA[loc])
    path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ {path}")

def main():
    for loc in ["it", "en", "fr", "es", "de"]:
        write_locale(loc)
    print("\n✅ Messaggi minimi aggiornati (home.title + home.intro + CTA).")

if __name__ == "__main__":
    main()
