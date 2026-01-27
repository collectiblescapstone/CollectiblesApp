import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Set } from '@prisma/client';

export const dynamic = 'force-static';

export async function GET() {
  try {
    // Fetch all cards (or add filters here)
    const specifiedSets: Set[] = await prisma.set.findMany({});
    // const specifiedCards: Card[] = await prisma.card.findMany({
    //   where: {
    //     name: {
    //       contains: 'Rowlet',
    //     },
    //   },
    // });

    console.log(specifiedSets);

    return NextResponse.json(specifiedSets);
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch specified cards' },
      { status: 500 }
    );
  }
}
