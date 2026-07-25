import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path } = body;

    if (secret !== REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    revalidatePath(path);

    return NextResponse.json({ revalidated: true, path });
  } catch (error) {
    console.error('Revalidation API error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
