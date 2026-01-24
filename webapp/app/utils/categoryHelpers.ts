// webapp/app/utils/categoryHelpers.ts - VERSIONE CORRETTA CON TIPI
// Helper per organizzare categorie in gerarchia

import { createClient as createServerClient } from '@/app/lib/supabase/server';

// Definiamo i tipi per i dati restituiti da Supabase
interface ContentLocalizationWithCategories {
  content: {
    content_id: number;
    content_category: Array<{
      category_id: number;
    }>;
  };
}

export interface CategoryWithCount {
  category_id: number;
  category_key: string;
  name: string;
  parent_category_id: number | null;
  scope: string;
  count: number;
}

export interface CategoryNode {
  category_id: number;
  category_key: string;
  name: string;
  children?: CategoryNode[];
  count: number;
}

// Helper per identificare macro-categorie
export const MACRO_CATEGORIES = [
  'digital-safety',
  'digital-education', 
  'digital-ethics',
  'eu-updates'
];

export function isMacroCategory(categoryKey: string): boolean {
  return MACRO_CATEGORIES.includes(categoryKey);
}

export async function getCategoryHierarchy(
  locale: string,
  selectedCategory?: string
): Promise<CategoryNode[]> {
  const supabase = await createServerClient();
  
  // 1. Ottieni tutte le categorie progetto
  const { data: allCategories } = await supabase
    .from('category')
    .select(`
      category_id,
      category_key,
      name,
      parent_category_id,
      scope
    `)
    .eq('scope', 'project');
  
  if (!allCategories || allCategories.length === 0) {
    return [];
  }
  
  // 2. Ottieni tutti gli articoli pubblicati nella lingua corrente
  // Usiamo un tipo esplicito per il cast
  const { data: localizations } = await supabase
    .from('content_localization')
    .select(`
      content:content_id (
        content_id,
        content_category (
          category_id
        )
      )
    `)
    .eq('locale', locale)
    .eq('content.status', 'published')
    .eq('content.content_type', 'blog_post') as { 
      data: ContentLocalizationWithCategories[] | null 
    };
  
  // 3. Conta articoli per categoria
  const categoryCounts: Record<number, number> = {};
  
  if (localizations) {
    localizations.forEach(loc => {
      // Gestisci sia array che oggetto singolo
      const categories = loc.content?.content_category;
      
      if (categories) {
        const categoryArray = Array.isArray(categories) ? categories : [categories];
        
        categoryArray.forEach((cc: any) => {
          if (cc?.category_id) {
            const categoryId = cc.category_id;
            categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
          }
        });
      }
    });
  }
  
  // 4. Organizza in gerarchia
  const categoryMap = new Map<number, CategoryNode>();
  const rootCategories: CategoryNode[] = [];

  // Prima passata: crea tutti i nodi
  allCategories.forEach(cat => {
    categoryMap.set(cat.category_id, {
      category_id: cat.category_id,
      category_key: cat.category_key,
      name: cat.name,
      count: categoryCounts[cat.category_id] || 0,
      children: []
    });
  });

  // Seconda passata: collega figli ai parent
  allCategories.forEach(cat => {
    const node = categoryMap.get(cat.category_id);
    if (!node) return;

    if (cat.parent_category_id) {
      const parent = categoryMap.get(cat.parent_category_id);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  // Ordina: prima macro, poi per count discendente
  rootCategories.sort((a, b) => b.count - a.count);
  rootCategories.forEach(cat => {
    if (cat.children) {
      cat.children.sort((a, b) => b.count - a.count);
    }
  });

  return rootCategories;
}

// Versione semplificata alternativa se la query complessa causa problemi
export async function getCategoryHierarchySimple(): Promise<CategoryNode[]> {
  const supabase = await createServerClient();
  
  // Query più semplice: solo categorie senza conteggio articoli
  const { data: allCategories } = await supabase
    .from('category')
    .select(`
      category_id,
      category_key,
      name,
      parent_category_id,
      scope
    `)
    .eq('scope', 'project')
    .order('category_key');
  
  if (!allCategories) return [];
  
  // Organizza in gerarchia con conteggio zero (puoi calcolarlo dopo)
  const categoryMap = new Map<number, CategoryNode>();
  const rootCategories: CategoryNode[] = [];

  allCategories.forEach(cat => {
    categoryMap.set(cat.category_id, {
      category_id: cat.category_id,
      category_key: cat.category_key,
      name: cat.name,
      count: 0, // Conteggio verrà aggiornato dopo
      children: []
    });
  });

  allCategories.forEach(cat => {
    const node = categoryMap.get(cat.category_id);
    if (!node) return;

    if (cat.parent_category_id) {
      const parent = categoryMap.get(cat.parent_category_id);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

// Ottieni macro-categoria da sottocategoria
export function getMacroCategoryForSub(
  categories: CategoryNode[],
  subCategoryKey: string
): string | null {
  for (const macro of categories) {
    if (macro.children?.some(child => child.category_key === subCategoryKey)) {
      return macro.category_key;
    }
  }
  return null;
}

// Ottieni il percorso completo di una categoria (macro > sub)
export function getCategoryPath(
  categories: CategoryNode[],
  categoryKey: string
): { macro?: string; sub: string } | null {
  // Se è una macro-categoria
  if (isMacroCategory(categoryKey)) {
    return { sub: categoryKey };
  }
  
  // Se è una sottocategoria, trova la macro
  for (const macro of categories) {
    if (macro.children?.some(child => child.category_key === categoryKey)) {
      return { macro: macro.category_key, sub: categoryKey };
    }
  }
  
  return null;
}