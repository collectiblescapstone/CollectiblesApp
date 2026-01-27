import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
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
      // collection: {
      //   include: {
      //     card: true,
      //   },
      // },
      // wishlist: {
      //   include: {
      //     card: true,
      //   },
      // },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User does not exist' }, { status: 404 });
  }

  return NextResponse.json(user);
}
