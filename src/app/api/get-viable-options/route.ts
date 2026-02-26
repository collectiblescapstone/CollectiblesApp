import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const POST = async (request: Request) => {
  const { userID } = await request.json();

  if (!userID) {
    return NextResponse.json(
      { error: 'No userID given, fetch terminated' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userID },
    select: {
      latitude: true,
      longitude: true,
      wishlist: {
        select: {
          card: {
            select: {
              name: true,
              id: true,
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
          id: true,
          name: true,
          image_url: true,
        },
      },
    },
  });

  const tradeListCardIds = new Set(
    tradeList.map((entry) => entry.card.id)
  );

  const wishlistCardIds = user.wishlist.map((item) => item.card.id);

  const tradeMatches = wishlistCardIds.length
    ? await prisma.collectionEntry.findMany({
        where: {
          forTrade: true,
          cardId: { in: wishlistCardIds },
          userId: { not: userID },
        },
        select: {
          card: {
            select: {
              id: true,
              name: true,
              image_url: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              profile_pic: true,
              longitude: true,
              latitude: true,
              wishlist: {
                select: {
                  card: {
                    select: {
                      name: true,
                      id: true,
                      image_url: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    : [];

  const viableOptionsMap = new Map<
    string,
    {
      card: { id: string; name: string; image_url: string };
      users: {
        id: string;
        username: string | null;
        profile_pic: number;
        longitude: number | null;
        latitude: number | null;
      }[];
    }
  >();

  for (const match of tradeMatches) {
    const hasMutualTrade = match.user.wishlist.some((wishlistEntry) =>
      tradeListCardIds.has(wishlistEntry.card.id)
    );

    if (!hasMutualTrade) {
      continue;
    }

    const existing = viableOptionsMap.get(match.card.id);
    if (existing) {
      existing.users.push(match.user);
    } else {
      viableOptionsMap.set(match.card.id, {
        card: match.card,
        users: [match.user],
      });
    }
  }

  return NextResponse.json({
    ...user,
    tradeList,
    viableOptions: Array.from(viableOptionsMap.values()),
  });
};
