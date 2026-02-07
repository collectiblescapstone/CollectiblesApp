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

  const user = await prisma.user.findUnique({
    where: { id: userID },
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
      profile_pic: true,
      visibility: true,
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

  const showcaseList = await prisma.collectionEntry.findMany({
    where: {
      userId: userID,
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
