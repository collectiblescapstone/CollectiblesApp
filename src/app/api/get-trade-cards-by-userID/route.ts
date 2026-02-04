import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-static';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userID = searchParams.get('userID');

  if (!userID) {
    return NextResponse.json(
      { error: 'No userID given, fetch terminated' },
      { status: 400 }
    );
  }

  const tradeCards = await prisma.collectionEntry.findMany({
    where: {
      userId: userID,
      forTrade: true,
    },
    select: {
      card: {
        select: {
          name: true,
          image_url: true,
        },
      },
    },
  });

  return NextResponse.json(tradeCards);
};
