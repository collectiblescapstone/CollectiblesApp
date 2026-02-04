import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-static';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'No username given, fetch terminated' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: username },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      email: true,
      bio: true,
      location: true,
      instagram: true,
      twitter: true,
      facebook: true,
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

  return NextResponse.json(user);
};
