import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Card } from '@prisma/client';

export const dynamic = 'force-static';

export async function GET(request: Request) {
  try {
    // Fetch all cards (or add filters here)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let specifiedCards: Card[] = [];

    if (type === 'pokemon') {
      const pId = Number(searchParams.get('pId'));

      specifiedCards = await prisma.card.findMany({
        where: {
          dexId: {
            has: pId,
          },
        },
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
    } else if (type === 'set') {
      const setId = searchParams.get('setId');

      specifiedCards = await prisma.card.findMany({
        where: {
          setId: {
            equals: setId || '',
          },
        },
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
    }
    return NextResponse.json(specifiedCards);
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch specified cards' },
      { status: 500 }
    );
  }
}
