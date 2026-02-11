import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic =
  process.env.NODE_ENV === 'development' ? 'force-static' : 'force-dynamic';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const userName = searchParams.get('userName');

  if (!userName) {
    return NextResponse.json(
      { error: 'No userName given, fetch terminated' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: userName },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      location: true,
      instagram: true,
      x: true,
      facebook: true,
      discord: true,
      whatsapp: true,
      wishlist: {
        select: {
          card: {
            select: {
              name: true,
              image_url: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const tradeList = await prisma.collectionEntry.findMany({
    where: {
      userId: user.id,
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

  const showcaseList = await prisma.collectionEntry.findMany({
    where: {
      userId: user.id,
      showcase: true,
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

  return NextResponse.json({ ...user, tradeList, showcaseList });
};
