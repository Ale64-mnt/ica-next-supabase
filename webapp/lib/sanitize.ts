import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

let purify: ReturnType<typeof createDOMPurify> | null = null;

export function sanitizeHtml(dirty: string): string {
  if (!purify) {
    const window = new JSDOM("").window as unknown as Window;
    purify = createDOMPurify(window);
  }
  return purify!.sanitize(dirty, {
    ALLOWED_ATTR: ["href", "title", "alt", "src", "target", "rel"],
    ALLOWED_TAGS: [
      "a","abbr","b","blockquote","br","code","em","i","img","li","ol","p","pre","strong","ul",
      "h1","h2","h3","h4","h5","h6","hr","table","thead","tbody","tr","th","td"
    ]
  }) as string;
}
