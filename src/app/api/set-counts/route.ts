import prisma from '@/lib/prisma';

export const dynamic = 'force-static';

export const POST = async (request: Request) => {
  const { userId, setId, pId } = await request.json();

  if (!userId || (!setId && !pId)) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
    });
  }

  try {
    let masterSetCount;
    let grandmasterSetCount;

    if (setId) {
      masterSetCount = (
        await prisma.collectionEntry.findMany({
          where: {
            userId,
            card: {
              setId,
            },
          },
          distinct: ['cardId'],
          select: { cardId: true },
        })
      ).length;

      grandmasterSetCount = (
        await prisma.collectionEntry.findMany({
          where: {
            userId,
            card: {
              setId,
            },
          },
          distinct: ['cardId', 'variant'],
          select: { cardId: true },
        })
      ).length;
    } else if (pId) {
      const dexNumber = Number(pId);

      if (Number.isNaN(dexNumber)) {
        throw new Error(`Invalid pId: ${pId}`);
      }

      masterSetCount = (
        await prisma.collectionEntry.findMany({
          where: {
            userId,
            card: {
              dexId: {
                has: dexNumber,
              },
            },
          },
          distinct: ['cardId'],
        })
      ).length;

      grandmasterSetCount = (
        await prisma.collectionEntry.findMany({
          where: {
            userId,
            card: {
              dexId: {
                has: dexNumber,
              },
            },
          },
          distinct: ['cardId', 'variant'],
          select: { cardId: true },
        })
      ).length;
    }

    console.log(
      setId || pId,
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
