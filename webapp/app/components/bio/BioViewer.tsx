// app/components/bio/BioViewer.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

interface BioViewerProps {
  locale: string;
  slug: string;
  type?: 'bio' | 'author';  // Nuovo parametro per distinguere il tipo
}

// 🔥 NUOVA INTERFACCIA per il frontmatter compatibile con BioLayout
interface BioFrontmatter {
  name?: string;
  title?: string;      // Cambiato da 'role' a 'title' per compatibilità
  role?: string;       // Mantenuto per retrocompatibilità
  photoAlt?: string;
  photoUrl?: string;
  additionalInfo?: string;
  meta_title?: string;
  meta_description?: string;
}

interface ParsedContent {
  data: BioFrontmatter;
  content: string;
}

// 🔥 NUOVA FUNZIONE: Ritorna dati compatibili con BioLayout
export async function getBioViewerData({ locale, slug, type = 'bio' }: BioViewerProps) {
  try {
    // 1. Determina il percorso in base al tipo
    let filePath: string;
    
    if (type === 'bio') {
      // Per biografie team: content/bios/[slug]/[locale].md
      filePath = path.join(
        process.cwd(),
        'content',
        'bios',
        slug,
        `${locale}.md`
      );
    } else {
      // Per autori: non usiamo file markdown, ma database
      // Ritorniamo null, la pagina autore gestirà diversamente
      return null;
    }

    // 2. Verifica che il file esista
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 3. Leggi e parsare il file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent) as ParsedContent;

    // 4. Converti Markdown -> HTML
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(content);
      
    const contentHtml = processedContent.toString();

    // 5. Logica per determinare la sorgente foto
    let photoUrl: string;
    let isRemotePhoto = false;

    if (frontmatter?.photoUrl) {
      photoUrl = frontmatter.photoUrl;
      isRemotePhoto = true;
    } else {
      // Foto locale (fallback predefinito)
      const localPhotoPath = path.join(
        process.cwd(),
        'public',
        'content',
        'bios',
        slug,
        'photo.webp'
      );
      
      if (fs.existsSync(localPhotoPath)) {
        photoUrl = `/content/bios/${slug}/photo.webp`;
      } else {
        // Placeholder con nome slug
        photoUrl = `https://twwgfrbcndouazujgcma.supabase.co/storage/v1/object/public/images/bios/${slug}.jpg`;
        isRemotePhoto = true;
        console.warn(`No photo found for ${slug}, using default`);
      }
    }

    // 🔥 6. Ritorna dati nel FORMATO COMPATIBILE con BioLayout
    return {
      // Formato compatibile con BioLayout
      name: frontmatter?.name || 'Nome non disponibile',
      title: frontmatter?.title || frontmatter?.role || '', // Usa title o role
      bioContent: contentHtml,
      photoUrl,
      photoAlt: frontmatter?.photoAlt || `Foto di ${frontmatter?.name || 'persona'}`,
      isRemotePhoto,
      additionalInfo: frontmatter?.additionalInfo,
      metaTitle: frontmatter?.meta_title,
      metaDescription: frontmatter?.meta_description
    };
  } catch (error) {
    console.error(`Error loading bio ${slug} for ${locale}:`, error);
    throw error;
  }
}

// 🔥 COMPONENTE CLIENT per visualizzare contenuto HTML
export default function BioViewer({ content }: { content: string }) {
  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}