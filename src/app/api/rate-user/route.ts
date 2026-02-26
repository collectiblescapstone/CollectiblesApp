import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  const { username, rating } = await request.json();

  if (!username || rating === undefined) {
    return NextResponse.json(
      { error: 'No username or rating given, fetch terminated' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { username: username },
    select: {
      id: true,
      rating: true,
      rating_count: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const newRatingCount = user.rating_count + 1;
  const newRating = (user.rating * user.rating_count + rating) / newRatingCount;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      rating: newRating,
      rating_count: newRatingCount,
    },
  });

  return NextResponse.json({ message: 'Rating submitted successfully' });
};
