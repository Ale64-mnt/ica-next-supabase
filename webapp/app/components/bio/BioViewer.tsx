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
}

// 🔥 INTERFACCIA per il frontmatter
interface BioFrontmatter {
  name?: string;
  role?: string;
  photoAlt?: string;
  photoUrl?: string;
}

// 🔥 Tipo per il risultato di gray-matter
interface ParsedContent {
  data: BioFrontmatter;
  content: string;
}

export async function BioViewer({ locale, slug }: BioViewerProps) {
  try {
    // 1. Costruisci il percorso al file .md
    const filePath = path.join(
      process.cwd(),
      'content',
      'bios',
      slug,
      `${locale}.md`
    );

    // 2. Verifica che il file esista
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // 3. Leggi e parsare il file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // 🔥 CORREZIONE: Usa 'as' per il type assertion
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
      // CASO 1: URL remoto specificato nel frontmatter
      photoUrl = frontmatter.photoUrl;
      isRemotePhoto = true;
    } else {
      // CASO 2: Foto locale (fallback predefinito)
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
        // CASO 3: Nessuna foto disponibile - usa placeholder
        photoUrl = '/images/avatar-placeholder.svg';
        console.warn(`No photo found for ${slug}, using placeholder`);
      }
    }

    // 6. Ritorna dati strutturati con valori di fallback
    return {
      frontmatter: {
        name: frontmatter?.name || 'Nome non disponibile',
        role: frontmatter?.role || '',
        photoAlt: frontmatter?.photoAlt || `Foto di ${frontmatter?.name || 'persona'}`,
      },
      contentHtml,
      photoUrl,
      isRemotePhoto,
    };
  } catch (error) {
    console.error(`Error loading bio ${slug} for ${locale}:`, error);
    throw error;
  }
}