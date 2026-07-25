import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/meilisearch';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ hits: [] });
  }

  try {
    const hits = await searchProducts(q, 20);
    return NextResponse.json({ hits });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Ошибка поиска. Попробуйте позже.', hits: [] },
      { status: 503 }
    );
  }
}
