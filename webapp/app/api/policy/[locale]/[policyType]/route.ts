// app/api/policy/[locale]/[policyType]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string; policyType: string }> }
) {
  try {
    const params = await context.params;
    const { locale, policyType } = params;

    // Percorso sicuro al file Markdown
    const policyFilePath = path.join(
      process.cwd(),
      'content',
      'policies',
      locale,
      `${policyType}.md`
    );

    // Controlla se il file esiste per la locale richiesta
    if (!fs.existsSync(policyFilePath)) {
      // Se il file non esiste e non stiamo già cercando in inglese, prova il fallback
      if (locale !== 'en') {
        const fallbackPath = path.join(
          process.cwd(),
          'content',
          'policies',
          'en',
          `${policyType}.md`
        );
        if (fs.existsSync(fallbackPath)) {
          const content = fs.readFileSync(fallbackPath, 'utf-8');
          return new NextResponse(content, {
            status: 200,
            headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
          });
        }
      }
      // Se non esiste neanche il fallback, restituisci 404
      return new NextResponse(`Policy file not found for locale: ${locale}`, { status: 404 });
    }

    // Leggi e restituisci il file
    const content = fs.readFileSync(policyFilePath, 'utf-8');
    return new NextResponse(content, {
      status: 200,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });

  } catch (error) {
    console.error('API Error reading policy file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}