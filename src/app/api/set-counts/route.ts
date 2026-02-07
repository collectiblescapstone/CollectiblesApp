import prisma from '@/lib/prisma';

export const dynamic = 'force-static';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('userId');
  const setId = searchParams.get('setId');
  const masterSet = searchParams.get('masterSet') === 'true';

  if (!userId || !setId) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
    });
  }

  try {
    const count = (
      await prisma.collectionEntry.findMany({
        where: {
          userId,
          setId,
        },
        distinct: ['cardId'],
        select: { cardId: true },
      })
    ).length;

    console.log(setId, count);

    return new Response(
      JSON.stringify({
        count,
        masterSet,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error,
      }),
      { status: 500 }
    );
  }
};
