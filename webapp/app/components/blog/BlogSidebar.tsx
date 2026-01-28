// app/components/blog/BlogSidebar.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

interface SubCategory {
  category_id: number;
  category_key: string;
  name: string;
  count: number;
}

interface MacroCategory {
  category_id: number;
  category_key: string;
  name: string;
  count: number;
  subCategories: SubCategory[];
}

interface BlogSidebarProps {
  categories: any[];
  currentLocale: string;
}

export default function BlogSidebar({ categories, currentLocale }: BlogSidebarProps) {
  const t = useTranslations("Blog");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { macroCategories, totalArticles } = useMemo(() => {
    return processCategories(categories, currentLocale);
  }, [categories, currentLocale]);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) next.delete(categoryKey);
      else next.add(categoryKey);
      return next;
    });
  };

  return (
    <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t("filter_by_category")}</h3>
          <Link href={`/${currentLocale}/blog`} className="text-sm text-blue-600 hover:text-blue-800">
            {t("clear_all")}
          </Link>
        </div>

        <Link
          href={`/${currentLocale}/blog`}
          className="flex justify-between items-center px-4 py-3 rounded-lg transition-all duration-200 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-2 border-blue-300 shadow-sm hover:shadow-md"
        >
          <span className="font-semibold">{t("all_categories")}</span>
          <span className="text-sm bg-white px-2.5 py-1 rounded-full font-medium shadow-sm">
            {totalArticles}
          </span>
        </Link>

        {macroCategories.map((macroCat) => {
          const isExpanded = expandedCategories.has(macroCat.category_key);
          const hasSubCategories = macroCat.subCategories.length > 0;

          return (
            <div key={macroCat.category_key} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(macroCat.category_key)}
                className="w-full flex justify-between items-center px-4 py-3 text-left transition-colors hover:bg-gray-50 text-gray-700"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  {hasSubCategories ? (
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform ${
                        isExpanded ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  ) : (
                    <div className="w-4" />
                  )}
                  <span className="font-semibold">{t(`categories.macro.${macroCat.category_key}`)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {macroCat.count} {t("articles")}
                  </span>
                  <Link
                    href={`/${currentLocale}/blog?category=${macroCat.category_key}`}
                    className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("view_all")}
                  </Link>
                </div>
              </button>

              {hasSubCategories && isExpanded && (
                <div className="bg-gray-50 border-t border-gray-200">
                  {macroCat.subCategories.map((subCat) => (
                    <Link
                      key={subCat.category_id}
                      href={`/${currentLocale}/blog?category=${subCat.category_key}`}
                      className="flex justify-between items-center px-4 py-2.5 pl-11 transition-colors hover:bg-gray-100 text-gray-700"
                    >
                      <span className="text-sm">{t(`categories.sub.${subCat.category_key}`)}</span>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full">{subCat.count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function processCategories(categories: any[], locale: string) {
  const macroMap = new Map<number, MacroCategory>();

  // Set globale: tutti i content_id distinti visibili in questa locale
  const globalContentIds = new Set<number>();

  // Helper: estrae i content_id distinti per una categoria
  const getDistinctContentIdsForCategory = (cat: any): Set<number> => {
    const ids = new Set<number>();

    const contentCategoryRows = Array.isArray(cat?.content_category) ? cat.content_category : [];
    for (const cc of contentCategoryRows) {
      const contentId = cc?.content?.content_id;
      const localizations = cc?.content?.content_localization;

      const hasLocale =
        Array.isArray(localizations) && localizations.some((cl: any) => cl?.locale === locale);

      if (hasLocale && typeof contentId === "number") {
        ids.add(contentId);
      }
    }

    return ids;
  };

  // 1) Inizializza macro
  for (const cat of categories) {
    if (!cat?.parent_category_id) {
      const ids = getDistinctContentIdsForCategory(cat);

      for (const id of ids) globalContentIds.add(id);

      macroMap.set(cat.category_id, {
        category_id: cat.category_id,
        category_key: cat.category_key,
        name: cat.name,
        count: ids.size,
        subCategories: [],
      });
    }
  }

  // 2) Aggiungi sub + aggiorna globalContentIds
  for (const cat of categories) {
    if (cat?.parent_category_id) {
      const parent = macroMap.get(cat.parent_category_id);
      if (!parent) continue;

      const ids = getDistinctContentIdsForCategory(cat);

      for (const id of ids) globalContentIds.add(id);

      parent.subCategories.push({
        category_id: cat.category_id,
        category_key: cat.category_key,
        name: cat.name,
        count: ids.size,
      });
    }
  }

  // 3) Opzionale ma utile: se una macro ha subcategorie, spesso vuoi che il count macro sia
  //    il numero di articoli distinti presenti nelle sub (non la somma semplice).
  //    Così non “sparisce” se i contenuti sono tutti taggati sulle sub.
  for (const macro of macroMap.values()) {
    if (macro.subCategories.length > 0) {
      const macroDistinct = new Set<number>();

      // articoli direttamente sulla macro (già in macro.count ma non abbiamo gli ids salvati)
      // quindi ricostruiamo anche questi ids:
      const macroCat = categories.find((c: any) => c?.category_id === macro.category_id);
      const macroDirectIds = macroCat ? getDistinctContentIdsForCategory(macroCat) : new Set<number>();
      for (const id of macroDirectIds) macroDistinct.add(id);

      // articoli sulle sub (distinct)
      for (const sub of macro.subCategories) {
        const subCat = categories.find((c: any) => c?.category_id === sub.category_id);
        const subIds = subCat ? getDistinctContentIdsForCategory(subCat) : new Set<number>();
        for (const id of subIds) macroDistinct.add(id);
      }

      macro.count = macroDistinct.size;
    }
  }

  const macroCategories = Array.from(macroMap.values()).sort((a, b) => b.count - a.count);
  for (const macro of macroCategories) {
    macro.subCategories.sort((a, b) => b.count - a.count);
  }

  return { macroCategories, totalArticles: globalContentIds.size };
}
