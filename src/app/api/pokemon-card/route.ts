import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Card } from '@prisma/client';

export const dynamic = 'force-static';

export async function GET() {
  try {
    // Fetch all cards (or add filters here)

    const specifiedCards: Card[] = await prisma.card.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        types: true,
        illustrator: true,
        rarity: true,
        variants: true,
        dexId: true,
        image_url: true,
        setId: true,
        set: { select: { official: true } },
      },
    });
    return NextResponse.json(specifiedCards);
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch specified cards' },
      { status: 500 }
    );
  }
}
