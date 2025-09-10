# Tools/ica_toolchain.py
# ICA Toolchain v1 – unico entrypoint per layout, i18n, worklog, sum, status
from __future__ import annotations
import argparse, re
from datetime import datetime
from pathlib import Path

VERSION = "ICA Toolchain v1"

ROOT = Path(__file__).resolve().parents[1]
APP  = ROOT / "webapp"

# -------------------- Utils comuni --------------------
def write(p: Path, content: str):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print("✓", p.relative_to(ROOT))

def human(minutes: int) -> str:
    h, m = minutes // 60, minutes % 60
    if h and m: return f"{h}h {m}m"
    if h: return f"{h}h"
    return f"{m}m"

def parse_duration(s: str) -> int:
    s = s.strip().lower()
    m = re.match(r"^\s*(\d{1,2}):(\d{2})\s*$", s)
    if m: return int(m.group(1))*60 + int(m.group(2))
    hours = re.search(r"(\d+)\s*h", s)
    mins  = re.search(r"(\d+)\s*m", s)
    if hours or mins:
        return (int(hours.group(1)) if hours else 0)*60 + (int(mins.group(1)) if mins else 0)
    if s.isdigit(): return int(s)
    raise ValueError(f"Durata non riconosciuta: {s}")

# -------------------- layout (design + pagine base) --------------------
def cmd_layout():
    files = {
        APP/"app"/"globals.css": r""":root{--brand:#2242d8;--brand-600:#1c36ad;--brand-700:#172b8b;--fg:#0e1116;--fg-muted:#5b667a;--bg:#fff;--bg-muted:#f6f7fb;--border:#e6e8ef;--success:#17a34a;--warning:#f59e0b;--danger:#ef4444;--font-sans:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,"Helvetica Neue",Arial,"Noto Sans","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";--maxw:1160px;--radius:14px;--shadow-sm:0 1px 2px rgba(17,24,39,.06);--shadow-md:0 6px 24px rgba(10,15,35,.08);--space-1:.25rem;--space-2:.5rem;--space-3:.75rem;--space-4:1rem;--space-6:1.5rem;--space-8:2rem;--space-12:3rem}
*{box-sizing:border-box}html,body{height:100%}body{margin:0;color:var(--fg);background:var(--bg);font-family:var(--font-sans);-webkit-font-smoothing:antialiased}
a{color:var(--brand);text-decoration:none}a:hover{color:var(--brand-700);text-decoration:underline}
.container{max-width:var(--maxw);margin-inline:auto;padding-inline:var(--space-4)}
.section{padding:var(--space-12) 0}.section--muted{background:var(--bg-muted)}
.grid{display:grid;gap:var(--space-6)}@media(min-width:768px){.grid--3{grid-template-columns:repeat(3,1fr)}.grid--2{grid-template-columns:repeat(2,1fr)}}
.prose h1{font-size:clamp(1.75rem,1.2rem+2vw,2.5rem);line-height:1.15;margin:.3em 0 .4em}
.prose h2{font-size:1.5rem;margin:1.2em 0 .6em}.prose p{color:var(--fg);line-height:1.65}.prose .muted{color:var(--fg-muted)}
.btn{display:inline-flex;align-items:center;gap:.5rem;border-radius:10px;padding:.65rem 1rem;font-weight:600;border:1px solid transparent}
.btn--primary{background:var(--brand);color:#fff;box-shadow:var(--shadow-sm)}.btn--primary:hover{background:var(--brand-600)}
.btn--ghost{background:transparent;color:var(--brand);border-color:var(--brand)}.btn--ghost:hover{background:rgba(34,66,216,.06)}
""",
        APP/"components"/"ui"/"card.module.css": r""".card{background:#fff;border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm);transition:transform .12s ease, box-shadow .2s ease}
.link:hover .card{transform:translateY(-2px);box-shadow:var(--shadow-md)}
.cover{width:100%;aspect-ratio:16/9;object-fit:cover;background:#eef1f7}.body{padding:var(--space-4)}
.meta{font-size:.85rem;color:var(--fg-muted);margin-bottom:.25rem}.title{margin:.2rem 0 .4rem;font-size:1.1rem;line-height:1.3}
.text{color:var(--fg-muted)}
""",
        APP/"components"/"ui"/"Card.tsx": r"""import React,{PropsWithChildren} from 'react';import styles from './card.module.css';
type Props=PropsWithChildren<{href?:string;title?:string;meta?:string;image?:string}>;
export default function Card({href,title,meta,image,children}:Props){const content=(<article className={styles.card}>{image&&<img src={image} alt="" className={styles.cover}/>}<div className={styles.body}>{meta&&<div className={styles.meta}>{meta}</div>}{title&&<h3 className={styles.title}>{title}</h3>}<div className={styles.text}>{children}</div></div></article>);return href?<a className={styles.link} href={href}>{content}</a>:content;}
""",
        APP/"components"/"ui"/"Button.tsx": r"""export default function Button({children,href,onClick,variant='primary'}:{children:React.ReactNode;href?:string;onClick?:()=>void;variant?:'primary'|'ghost'}){const cls=variant==='primary'?'btn btn--primary':'btn btn--ghost';const el=<button className={cls} onClick={onClick}>{children}</button>;return href?<a className={cls} href={href}>{children}</a>:el;}
""",
        APP/"components"/"ui"/"PageHeader.tsx": r"""export default function PageHeader({title,kicker,actions}:{title:string;kicker?:string;actions?:React.ReactNode;}){return(<header className="section"><div className="container">{kicker&&<div className="muted" style={{marginBottom:4}}>{kicker}</div>}<h1 style={{marginBottom:12}}>{title}</h1>{actions}</div></header>);}
""",
        APP/"components"/"ui"/"Section.tsx": r"""export default function Section({title,muted=false,children}:{title?:string;muted?:boolean;children:React.ReactNode;}){return(<section className={`section ${muted?'section--muted':''}`}><div className="container">{title&&<h2 style={{marginBottom:12}}>{title}</h2>}{children}</div></section>);}
""",
        APP/"app"/"page.tsx": r"""import Section from "@/components/ui/Section";import Card from "@/components/ui/Card";import Button from "@/components/ui/Button";import PageHeader from "@/components/ui/PageHeader";
export default function Home(){return(<><PageHeader kicker="Institute for Conscious Action" title="Educazione finanziaria, digitale ed etica — chiara e accessibile." actions={<Button href="/articles" variant="primary">Scopri gli articoli</Button>} />
<Section title="Ultime News"><div className="grid grid--3"><Card href="/news/demo" meta="17 gen 2025 • Bank of England" title="Quiz di educazione economica (£1.000)">Breve sintesi… metodo ludico per stimolare la comprensione di concetti economici quotidiani.</Card><Card href="#" title="Esempio 2">Contenuto di esempio</Card><Card href="#" title="Esempio 3">Contenuto di esempio</Card></div><div style={{marginTop:'1rem'}}><Button href="/news" variant="ghost">Tutte le news</Button></div></Section>
<Section title="Articoli in primo piano" muted><div className="grid grid--3"><Card href="/articles/demo" image="/placeholder.jpg" meta="Educazione Finanziaria" title="Risparmio e budgeting">Introduzione rapida…</Card><Card href="/articles/demo2" image="/placeholder.jpg" meta="Etica & Consapevolezza" title="Benessere digitale">…</Card><Card href="/articles/demo3" image="/placeholder.jpg" meta="Educazione Digitale" title="Sicurezza online 101">…</Card></div></Section>
<Section title="Risorse educative"><div className="grid grid--2"><Card href="/glossary" title="Glossario">Termini complessi spiegati semplice.</Card><Card href="/faq" title="FAQ">Domande frequenti…</Card></div></Section>
<Section muted><div className="grid grid--2"><div className="prose"><h2>Chi siamo</h2><p className="muted">Mission, trasparenza ed etica editoriale.</p><Button href="/about" variant="ghost">Scopri di più</Button></div><div className="prose"><h2>Iscriviti alla newsletter</h2><p className="muted">Aggiornamenti mensili, nessuno spam.</p></div></div></Section></>);}
""",
        APP/"app"/"about"/"page.tsx": r"""import PageHeader from "@/components/ui/PageHeader";import Section from "@/components/ui/Section";
export default function AboutPage(){return(<><PageHeader title="Chi siamo" kicker="Institute for Conscious Action" /><Section><article className="prose"><p>Missione, visione, trasparenza ed etica editoriale.</p></article></Section></>);}
""",
        APP/"app"/"news"/"page.tsx": r"""import PageHeader from "@/components/ui/PageHeader";import Section from "@/components/ui/Section";import Card from "@/components/ui/Card";
export const revalidate=60;export default function NewsPage(){return(<><PageHeader title="News" kicker="Aggiornamenti e segnalazioni"/><Section><div className="grid grid--3"><Card href="/news/demo" meta="17 gen 2025 • Fonte" title="Titolo news">Riassunto breve…</Card></div></Section></>);}
""",
        APP/"app"/"articles"/"page.tsx": r"""import PageHeader from "@/components/ui/PageHeader";import Section from "@/components/ui/Section";import Card from "@/components/ui/Card";
export const revalidate=60;export default function ArticlesPage(){return(<><PageHeader title="Articoli" kicker="Approfondimenti evergreen"/><Section><div className="grid grid--3"><Card href="/articles/demo" title="Titolo articolo" image="/placeholder.jpg">Breve estratto…</Card></div></Section></>);}
""",
        APP/"app"/"contact"/"page.tsx": r"""import PageHeader from "@/components/ui/PageHeader";import Section from "@/components/ui/Section";
export default function ContactPage(){return(<><PageHeader title="Contatti" kicker="Parla con noi"/><Section><form className="card" style={{maxWidth:600}}><label>Nome<br/><input style={{width:'100%'}} required/></label><br/><label>Email<br/><input type="email" style={{width:'100%'}} required/></label><br/><label>Messaggio<br/><textarea rows={5} style={{width:'100%'}}/></label><br/><button className="btn btn--primary">Invia</button></form></Section></>);}
""",
        APP/"app"/"faq"/"page.tsx": r"""import PageHeader from "@/components/ui/PageHeader";import Section from "@/components/ui/Section";
export default function FaqPage(){return(<><PageHeader title="FAQ" kicker="Domande frequenti"/><Section><article className="prose"><h2>Domanda 1</h2><p>Risposta…</p><h2>Domanda 2</h2><p>Risposta…</p></article></Section></>);}
""",
        APP/"app"/"glossary"/"page.tsx": r"""import PageHeader from "@/components/ui/PageHeader";import Section from "@/components/ui/Section";
export default function GlossaryPage(){return(<><PageHeader title="Glossario" kicker="Termini spiegati semplice"/><Section><article className="prose"><p>A-Z dei concetti chiave.</p></article></Section></>);}
""",
    }
    for p,c in files.items(): write(p,c)
    print("\n✅ Layout professionale applicato.")

# -------------------- i18n scaffold --------------------
def cmd_i18n():
    files = {
        APP/"i18n.ts": r"""export const locales=['it','en','fr','es','de'] as const;export type Locale=typeof locales[number];export const defaultLocale:Locale='it';""",
        APP/"middleware.ts": r"""import createMiddleware from 'next-intl/middleware';import {locales,defaultLocale} from './i18n';
export default createMiddleware({locales,defaultLocale,localePrefix:'always'});
export const config={matcher:['/((?!api|_next|.*\\..*).*)']};
""",
        APP/"messages"/"it.json": r"""{"common":{"brand":"Institute for Conscious Action","menu":{"home":"Home","news":"News","articles":"Educazione","about":"Chi siamo","faq":"FAQ","glossary":"Glossario","contact":"Contatti"},"cta":{"readMore":"Scopri di più","allNews":"Tutte le news","allArticles":"Tutti gli articoli"}},"home":{"title":"Educazione finanziaria, digitale ed etica — chiara e accessibile.","heroCta":"Scopri gli articoli","latestNews":"Ultime News","featuredArticles":"Articoli in primo piano","resources":"Risorse educative","aboutTeaser":"Mission, trasparenza ed etica editoriale.","newsletterTitle":"Iscriviti alla newsletter","newsletterText":"Aggiornamenti mensili, nessuno spam."},"news":{"title":"News","kicker":"Aggiornamenti e segnalazioni"},"articles":{"title":"Articoli","kicker":"Approfondimenti evergreen"},"about":{"title":"Chi siamo","kicker":"Institute for Conscious Action"},"faq":{"title":"FAQ","kicker":"Domande frequenti"},"glossary":{"title":"Glossario","kicker":"Termini spiegati semplice"},"contact":{"title":"Contatti","kicker":"Parla con noi"}}""",
        APP/"messages"/"en.json": r"""{"common":{"brand":"Institute for Conscious Action","menu":{"home":"Home","news":"News","articles":"Education","about":"About","faq":"FAQ","glossary":"Glossary","contact":"Contact"},"cta":{"readMore":"Learn more","allNews":"All news","allArticles":"All articles"}},"home":{"title":"Financial, digital and ethical education — clear and accessible.","heroCta":"Explore articles","latestNews":"Latest news","featuredArticles":"Featured articles","resources":"Educational resources","aboutTeaser":"Mission, transparency and editorial ethics.","newsletterTitle":"Join the newsletter","newsletterText":"Monthly updates, no spam."},"news":{"title":"News","kicker":"Updates and highlights"},"articles":{"title":"Articles","kicker":"Evergreen insights"},"about":{"title":"About us","kicker":"Institute for Conscious Action"},"faq":{"title":"FAQ","kicker":"Frequently asked questions"},"glossary":{"title":"Glossary","kicker":"Terms made simple"},"contact":{"title":"Contact","kicker":"Get in touch"}}""",
        APP/"messages"/"fr.json": r"""{"common":{"brand":"Institute for Conscious Action","menu":{"home":"Accueil","news":"Actualités","articles":"Éducation","about":"À propos","faq":"FAQ","glossary":"Glossaire","contact":"Contact"},"cta":{"readMore":"En savoir plus","allNews":"Toutes les actus","allArticles":"Tous les articles"}},"home":{"title":"Éducation financière, numérique et éthique — claire et accessible.","heroCta":"Découvrir les articles","latestNews":"Dernières actualités","featuredArticles":"Articles à la une","resources":"Ressources éducatives","aboutTeaser":"Mission, transparence et éthique éditoriale.","newsletterTitle":"Inscrivez-vous à la newsletter","newsletterText":"Mises à jour mensuelles, sans spam."},"news":{"title":"Actualités","kicker":"Mises à jour et points clés"},"articles":{"title":"Articles","kicker":"Analyses durables"},"about":{"title":"À propos","kicker":"Institute for Conscious Action"},"faq":{"title":"FAQ","kicker":"Questions fréquentes"},"glossary":{"title":"Glossaire","kicker":"Termes expliqués simplement"},"contact":{"title":"Contact","kicker":"Entrer en contact"}}""",
        APP/"messages"/"es.json": r"""{"common":{"brand":"Institute for Conscious Action","menu":{"home":"Inicio","news":"Noticias","articles":"Educación","about":"Quiénes somos","faq":"FAQ","glossary":"Glosario","contact":"Contacto"},"cta":{"readMore":"Saber más","allNews":"Todas las noticias","allArticles":"Todos los artículos"}},"home":{"title":"Educación financiera, digital y ética — clara y accesible.","heroCta":"Explorar artículos","latestNews":"Últimas noticias","featuredArticles":"Artículos destacados","resources":"Recursos educativos","aboutTeaser":"Misión, transparencia y ética editorial.","newsletterTitle":"Suscríbete al boletín","newsletterText":"Actualizaciones mensuales, sin spam."},"news":{"title":"Noticias","kicker":"Actualizaciones y destacados"},"articles":{"title":"Artículos","kicker":"Contenidos evergreen"},"about":{"title":"Quiénes somos","kicker":"Institute for Conscious Action"},"faq":{"title":"FAQ","kicker":"Preguntas frecuentes"},"glossary":{"title":"Glosario","kicker":"Términos explicados"},"contact":{"title":"Contacto","kicker":"Hablemos"}}""",
        APP/"messages"/"de.json": r"""{"common":{"brand":"Institute for Conscious Action","menu":{"home":"Start","news":"News","articles":"Bildung","about":"Über uns","faq":"FAQ","glossary":"Glossar","contact":"Kontakt"},"cta":{"readMore":"Mehr erfahren","allNews":"Alle News","allArticles":"Alle Artikel"}},"home":{"title":"Finanz-, Digital- und Ethikbildung — klar und zugänglich.","heroCta":"Artikel ansehen","latestNews":"Neueste News","featuredArticles":"Empfohlene Artikel","resources":"Bildungsressourcen","aboutTeaser":"Mission, Transparenz und redaktionelle Ethik.","newsletterTitle":"Newsletter abonnieren","newsletterText":"Monatliche Updates, kein Spam."},"news":{"title":"News","kicker":"Aktuelles und Highlights"},"articles":{"title":"Artikel","kicker":"Zeitlose Inhalte"},"about":{"title":"Über uns","kicker":"Institute for Conscious Action"},"faq":{"title":"FAQ","kicker":"Häufige Fragen"},"glossary":{"title":"Glossar","kicker":"Begriffe einfach erklärt"},"contact":{"title":"Kontakt","kicker":"Kontakt aufnehmen"}}""",
        APP/"components"/"LanguageSwitcher.tsx": r"""'use client'
import {usePathname,useRouter} from 'next/navigation';
const locales=['it','en','fr','es','de'];
function replaceLocale(path:string,locale:string){const parts=path.split('/');if(parts[1]&&locales.includes(parts[1])){parts[1]=locale;return parts.join('/');}return `/${locale}${path.startsWith('/')?'':'/'}${path}`;}
export default function LanguageSwitcher(){const router=useRouter();const pathname=usePathname();return(<select aria-label="Language" defaultValue={pathname.split('/')[1]} onChange={(e)=>router.push(replaceLocale(pathname,e.target.value))} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #e6e8ef'}}><option value="it">IT</option><option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option><option value="de">DE</option></select>);}
""",
        APP/"components"/"Nav.tsx": r"""'use client'
import Link from 'next/link';import LanguageSwitcher from './LanguageSwitcher';import {usePathname} from 'next/navigation';
export default function Nav(){const pathname=usePathname();const locale=pathname.split('/')[1]||'it';const L=(p:string)=>`/${locale}${p}`;return(<nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'12px 16px',borderBottom:'1px solid #e6e8ef'}}><Link href={L('/')} style={{fontWeight:800}}>ICA</Link><div style={{display:'flex',gap:16}}><Link href={L('/')} >Home</Link><Link href={L('/news')}>News</Link><Link href={L('/articles')}>Educazione</Link><Link href={L('/glossary')}>Glossario</Link><Link href={L('/faq')}>FAQ</Link><Link href={L('/about')}>Chi siamo</Link><Link href={L('/contact')}>Contatti</Link></div><LanguageSwitcher/></nav>);}
""",
        APP/"app"/"[locale]"/"layout.tsx": r"""import {NextIntlClientProvider} from 'next-intl';import {ReactNode} from 'react';import Nav from '@/components/Nav';
export const dynamic='force-dynamic';
export default async function LocaleLayout({children,params:{locale}}:{children:ReactNode;params:{locale:string}}){const messages=(await import(`@/messages/${locale}.json`)).default;return(<html lang={locale}><body><Nav/><NextIntlClientProvider messages={messages} locale={locale}>{children}</NextIntlClientProvider></body></html>);}
export async function generateStaticParams(){return[{locale:'it'},{locale:'en'},{locale:'fr'},{locale:'es'},{locale:'de'}];}
""",
        APP/"app"/"[locale]"/"page.tsx": r"""import Section from '@/components/ui/Section';import Card from '@/components/ui/Card';import Button from '@/components/ui/Button';import PageHeader from '@/components/ui/PageHeader';import {useTranslations} from 'next-intl';
export default function Home(){const t=useTranslations('home');return(<><PageHeader kicker="Institute for Conscious Action" title={t('title')} actions={<Button href="#" variant="primary">{t('heroCta')}</Button>} /><Section title={t('latestNews')}><div className="grid grid--3"><Card href="#" meta="17 gen 2025 • Bank of England" title="Quiz di educazione economica (£1.000)">Sintesi…</Card><Card href="#" title="Esempio 2">Contenuto di esempio</Card><Card href="#" title="Esempio 3">Contenuto di esempio</Card></div><div style={{marginTop:'1rem'}}><Button href="#" variant="ghost">Tutte le news</Button></div></Section><Section title={t('featuredArticles')} muted><div className="grid grid--3"><Card href="#" image="/placeholder.jpg" meta="Educazione Finanziaria" title="Risparmio e budgeting">Intro…</Card><Card href="#" image="/placeholder.jpg" meta="Etica & Consapevolezza" title="Benessere digitale">…</Card><Card href="#" image="/placeholder.jpg" meta="Educazione Digitale" title="Sicurezza online 101">…</Card></div></Section><Section title={t('resources')}><div className="grid grid--2"><Card href="#" title="Glossario">Termini semplici.</Card><Card href="#" title="FAQ">Domande frequenti.</Card></div></Section></>);}
""",
        APP/"app"/"[locale]"/"news"/"page.tsx": r"""import PageHeader from '@/components/ui/PageHeader';import Section from '@/components/ui/Section';import Card from '@/components/ui/Card';
export default function NewsPage(){return(<><PageHeader title="News" kicker="Aggiornamenti e segnalazioni"/><Section><div className="grid grid--3"><Card href="#" meta="17 gen 2025 • Fonte" title="Titolo news">Riassunto…</Card></div></Section></>);}
""",
        APP/"app"/"[locale]"/"articles"/"page.tsx": r"""import PageHeader from '@/components/ui/PageHeader';import Section from '@/components/ui/Section';import Card from '@/components/ui/Card';
export default function ArticlesPage(){return(<><PageHeader title="Articoli" kicker="Approfondimenti evergreen"/><Section><div className="grid grid--3"><Card href="#" title="Titolo articolo" image="/placeholder.jpg">Estratto…</Card></div></Section></>);}
""",
        APP/"app"/"[locale]"/"about"/"page.tsx": r"""import PageHeader from '@/components/ui/PageHeader';import Section from '@/components/ui/Section';
export default function AboutPage(){return(<><PageHeader title="Chi siamo" kicker="Institute for Conscious Action"/><Section><article className="prose"><p>Missione, visione, trasparenza ed etica editoriale.</p></article></Section></>);}
""",
        APP/"app"/"[locale]"/"faq"/"page.tsx": r"""import PageHeader from '@/components/ui/PageHeader';import Section from '@/components/ui/Section';
export default function FaqPage(){return(<><PageHeader title="FAQ" kicker="Domande frequenti"/><Section><article className="prose"><h2>Domanda 1</h2><p>Risposta…</p><h2>Domanda 2</h2><p>Risposta…</p></article></Section></>);}
""",
        APP/"app"/"[locale]"/"glossary"/"page.tsx": r"""import PageHeader from '@/components/ui/PageHeader';import Section from '@/components/ui/Section';
export default function GlossaryPage(){return(<><PageHeader title="Glossario" kicker="Termini spiegati semplice"/><Section><article className="prose"><p>A-Z dei concetti chiave.</p></article></Section></>);}
""",
        APP/"app"/"[locale]"/"contact"/"page.tsx": r"""import PageHeader from '@/components/ui/PageHeader';import Section from '@/components/ui/Section';
export default function ContactPage(){return(<><PageHeader title="Contatti" kicker="Parla con noi"/><Section><form className="card" style={{maxWidth:600}}><label>Nome<br/><input style={{width:'100%'}} required/></label><br/><label>Email<br/><input type="email" style={{width:'100%'}} required/></label><br/><label>Messaggio<br/><textarea rows={5} style={{width:'100%'}}/></label><br/><button className="btn btn--primary">Invia</button></form></Section></>);}
""",
    }
    for p,c in files.items(): write(p,c)
    print("\n✅ Impalcatura i18n creata/aggiornata.")

# -------------------- Worklog: append e sum --------------------
WORKLOG = ROOT/"worklog.md"
HEADER = "# Worklog – ICA Next.js + Supabase"
TOTAL  = "## Totale ore registrate:"

def ensure_worklog(text: str) -> str:
    if HEADER in text: return text
    return "\n".join([HEADER, f"{TOTAL} 0h", "", "---", ""]) + text

def recalc_total(text: str) -> str:
    total = 0
    for line in text.splitlines():
        if line.strip().startswith("⏱"):
            m = re.search(r"(\d{1,2}):(\d{2})", line)
            if m: total += int(m.group(1))*60 + int(m.group(2)); continue
            m2 = re.search(r"(\d+)\s*h(?:\s*(\d+)\s*m)?", line.lower())
            if m2: total += int(m2.group(1))*60 + int(m2.group(2) or 0); continue
            m3 = re.search(r"(\d+)\s*m\b", line.lower())
            if m3: total += int(m3.group(1)); continue
    new_total = human(total)
    lines = text.splitlines()
    for i,l in enumerate(lines):
        if l.startswith(TOTAL):
            lines[i] = f"{TOTAL} {new_total}"
            break
    else:
        lines.insert(1, f"{TOTAL} {new_total}")
    return "\n".join(lines), total

def cmd_log(task: str, duration: str|None, hours: int, minutes: int, notes: str, date: str|None):
    mins = parse_duration(duration) if duration else (hours*60+minutes)
    if mins<=0: raise SystemExit("Durata mancante: usa --duration '1h 20m' oppure --hours/--minutes")
    text = WORKLOG.read_text(encoding="utf-8") if WORKLOG.exists() else ""
    text = ensure_worklog(text)
    date_iso = date or datetime.now().strftime("%Y-%m-%d")
    entry = ["", f"### 📌 {date_iso} – {task}"]
    if notes:
        for r in [r.strip() for r in notes.split("\n") if r.strip()]:
            entry.append(f"- {r}")
    entry.append(f"⏱ {human(mins)}")
    entry.append("")
    text += "\n".join(entry)
    text, total = recalc_total(text)
    WORKLOG.write_text(text, encoding="utf-8")
    print(f"✅ Sessione registrata ({human(mins)}). Totale: {human(total)}")

def cmd_sum():
    if not WORKLOG.exists():
        print("❌ Nessun worklog.md trovato."); return
    text = WORKLOG.read_text(encoding="utf-8")
    _, total = recalc_total(text)
    print("📊 Totale ore registrate:", human(total))

# -------------------- status & version --------------------
def cmd_status():
    checks = [
        ("globals.css", APP/"app"/"globals.css"),
        ("Nav.tsx",     APP/"components"/"Nav.tsx"),
        ("messages/it", APP/"messages"/"it.json"),
        ("[locale]/layout", APP/"app"/"[locale]"/"layout.tsx"),
        ("worklog.md",  WORKLOG),
    ]
    for name, path in checks:
        print(("✓" if path.exists() else "✖"), name, "-", path.relative_to(ROOT))

def main():
    ap = argparse.ArgumentParser(description="ICA Toolchain – unico entrypoint")
    sub = ap.add_subparsers(dest="cmd")

    sub.add_parser("layout", help="Applica layout professionale")
    sub.add_parser("i18n",   help="Crea impalcatura multilingua")
    p_log = sub.add_parser("log", help="Aggiunge una sessione al worklog")
    p_log.add_argument("--task", required=True)
    p_log.add_argument("--duration")
    p_log.add_argument("--hours", type=int, default=0)
    p_log.add_argument("--minutes", type=int, default=0)
    p_log.add_argument("--notes", default="")
    p_log.add_argument("--date")
    sub.add_parser("sum", help="Mostra totale ore")
    sub.add_parser("status", help="Controlla file chiave")
    sub.add_parser("version", help="Mostra versione toolkit")

    args = ap.parse_args()
    if args.cmd=="layout": cmd_layout()
    elif args.cmd=="i18n": cmd_i18n()
    elif args.cmd=="log":   cmd_log(args.task, args.duration, args.hours, args.minutes, args.notes, args.date)
    elif args.cmd=="sum":   cmd_sum()
    elif args.cmd=="status":cmd_status()
    elif args.cmd=="version": print(VERSION)
    else:
        ap.print_help()

if __name__=="__main__":
    main()
