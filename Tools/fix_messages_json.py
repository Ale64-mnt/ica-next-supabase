# Tools/fix_messages_json.py
# Valida e ripara messages/*.json: UTF-8 no BOM, doppi apici, niente virgole finali.
# Se un file è irrecuperabile, lo riscrive con un seed minimo corretto.

from pathlib import Path
import json
import re
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "webapp"
MSG = WEB / "messages"
assert MSG.exists(), f"Manca la cartella {MSG}"

SEED = {
    "it": {
        "home": {"title": "Benvenuto", "intro": "Sito Next.js + i18n"},
        "nav": {"home": "Home", "about": "Chi siamo", "news": "Notizie", "articles": "Articoli", "contact": "Contatti", "faq": "FAQ", "glossary": "Glossario"},
        "about": {"title": "Chi siamo", "intro": "Informazioni sul progetto."},
        "news": {"title": "Notizie", "intro": "Ultimi aggiornamenti dal nostro team."},
        "articles": {"title": "Articoli", "intro": "Approfondimenti e guide."},
        "contact": {"title": "Contatti", "intro": "Come contattarci."},
        "faq": {"title": "Domande frequenti", "intro": "Risposte alle domande più comuni."},
        "glossary": {"title": "Glossario", "intro": "Termini e definizioni utili."}
    },
    "en": {
        "home": {"title": "Welcome", "intro": "Next.js + i18n site"},
        "nav": {"home": "Home", "about": "About", "news": "News", "articles": "Articles", "contact": "Contact", "faq": "FAQ", "glossary": "Glossary"},
        "about": {"title": "About us", "intro": "Information about the project."},
        "news": {"title": "News", "intro": "Latest updates from our team."},
        "articles": {"title": "Articles", "intro": "Insights and guides."},
        "contact": {"title": "Contact", "intro": "How to reach us."},
        "faq": {"title": "FAQ", "intro": "Frequently asked questions."},
        "glossary": {"title": "Glossary", "intro": "Useful terms and definitions."}
    },
    "fr": {
        "home": {"title": "Bienvenue", "intro": "Site Next.js + i18n"},
        "nav": {"home": "Accueil", "about": "À propos", "news": "Actualités", "articles": "Articles", "contact": "Contact", "faq": "FAQ", "glossary": "Glossaire"},
        "about": {"title": "À propos", "intro": "Informations sur le projet."},
        "news": {"title": "Actualités", "intro": "Dernières nouvelles de notre équipe."},
        "articles": {"title": "Articles", "intro": "Analyses et guides."},
        "contact": {"title": "Contact", "intro": "Comment nous contacter."},
        "faq": {"title": "FAQ", "intro": "Questions fréquentes."},
        "glossary": {"title": "Glossaire", "intro": "Termes et définitions utiles."}
    },
    "es": {
        "home": {"title": "Bienvenido", "intro": "Sitio Next.js + i18n"},
        "nav": {"home": "Inicio", "about": "Quiénes somos", "news": "Noticias", "articles": "Artículos", "contact": "Contacto", "faq": "FAQ", "glossary": "Glosario"},
        "about": {"title": "Quiénes somos", "intro": "Información sobre el proyecto."},
        "news": {"title": "Noticias", "intro": "Últimas novedades de nuestro equipo."},
        "articles": {"title": "Artículos", "intro": "Análisis y guías."},
        "contact": {"title": "Contacto", "intro": "Cómo contactarnos."},
        "faq": {"title": "FAQ", "intro": "Preguntas frecuentes."},
        "glossary": {"title": "Glosario", "intro": "Términos y definiciones útiles."}
    },
    "de": {
        "home": {"title": "Willkommen", "intro": "Next.js + i18n Seite"},
        "nav": {"home": "Start", "about": "Über uns", "news": "News", "articles": "Artikel", "contact": "Kontakt", "faq": "FAQ", "glossary": "Glossar"},
        "about": {"title": "Über uns", "intro": "Informationen zum Projekt."},
        "news": {"title": "News", "intro": "Neueste Updates unseres Teams."},
        "articles": {"title": "Artikel", "intro": "Einblicke und Anleitungen."},
        "contact": {"title": "Kontakt", "intro": "So erreichen Sie uns."},
        "faq": {"title": "FAQ", "intro": "Häufig gestellte Fragen."},
        "glossary": {"title": "Glossar", "intro": "Nützliche Begriffe und Definitionen."}
    }
}

def write_json(path: Path, obj: dict):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def try_parse(text: str):
    # rimuovi BOM
    text = text.lstrip("\ufeff")
    # togli commenti stile // e /* */
    text = re.sub(r"//.*", "", text)
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    # single quotes -> double (solo su chiavi/valori semplici)
    text = re.sub(r"'([^']*)'", r'"\1"', text)
    # rimuovi virgole finali prima di } o ]
    text = re.sub(r",\s*([}\]])", r"\1", text)
    return json.loads(text)

changed = []
for loc in ["it","en","fr","es","de"]:
    f = MSG / f"{loc}.json"
    backup = f.with_suffix(f.suffix + f".bak-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    if not f.exists():
        write_json(f, SEED[loc]); changed.append(f"{loc} (creato)")
        continue
    raw = f.read_text(encoding="utf-8", errors="ignore")
    try:
        data = try_parse(raw)
    except Exception:
        # file corrotto: backup e riscrivi seed
        f.rename(backup)
        write_json(f, SEED[loc]); changed.append(f"{loc} (riscritto)")
        continue
    # merge shallow con il seed (non sovrascrive valori esistenti)
    base = SEED[loc].copy()
    for top_k, top_v in data.items():
        if isinstance(top_v, dict):
            base.setdefault(top_k, {})
            base[top_k].update(top_v)
        else:
            base[top_k] = top_v
    f.rename(backup)
    write_json(f, base); changed.append(f"{loc} (pulito/mergiato)")

print("OK: messaggi validi in", MSG)
print("Modifiche:", ", ".join(changed))
