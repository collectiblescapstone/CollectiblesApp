import prisma from '@/lib/prisma';

export const GET = async (request: Request) => {
  const { userId, cardId } = await request.json();

  try {
    const cards = await prisma.collectionEntry.findMany({
      where: { userId: userId, cardId: cardId },
    });

    return new Response(
      JSON.stringify({
        cards,
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error for User Collection',
        message: error,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
