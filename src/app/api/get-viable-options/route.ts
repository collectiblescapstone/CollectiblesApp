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

  const tradeListCardIds = new Set(tradeList.map((entry) => entry.card.id));

  const wishlistCardIds = user.wishlist.map((item) => item.card.id);

  // Find all collection entries that are up for trade and match any card in the user's wishlist
  // Also check for the visibility of the person and make sure to only include those that have set their profile visibility to public
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
              // Using the longitude and latitude, calculate the distance between the original user and the user with the matching card to determine if they are a viable trade option based on proximity
              // the proximity part can come later, for now store the distance in the options and return it to the frontend to be used in the sorting of the options
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

  // Organize the viable options by card, grouping users who have the same card up for trade
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

  // For each trade match, check if the user has any card in their wishlist that matches a card in the original user's trade list
  for (const match of tradeMatches) {
    const hasMutualTrade = match.user.wishlist.some((wishlistEntry) =>
      tradeListCardIds.has(wishlistEntry.card.id)
    );

    if (!hasMutualTrade) {
      continue;
    }

    // If there's a mutual trade, add the user to the viable options for that card
    // Change this so that instead its a list of users with the cards they have up for trade that match the original user's wishlist
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
