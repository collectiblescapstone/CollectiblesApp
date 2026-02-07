import prisma from '@/lib/prisma';

export const dynamic = 'force-static';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('userId');
  const setId = searchParams.get('setId');

  if (!userId || !setId) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
    });
  }

  try {
    const masterSetCount = (
      await prisma.collectionEntry.findMany({
        where: {
          userId,
          setId,
        },
        distinct: ['cardId'],
        select: { cardId: true },
      })
    ).length;

    const grandmasterSetCount = (
      await prisma.collectionEntry.findMany({
        where: {
          userId,
          setId,
        },
        distinct: ['cardId', 'variant'],
        select: { cardId: true },
      })
    ).length;

    console.log(
      setId,
      '| Master Set: ',
      masterSetCount,
      ' | Grandmaster Set: ',
      grandmasterSetCount
    );

    return new Response(
      JSON.stringify({
        masterSetCount,
        grandmasterSetCount,
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
