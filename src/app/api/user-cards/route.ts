import prisma from '@/lib/prisma'

export const POST = async (request: Request) => {
    const { userId } = await request.json()

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Missing parameters' }), {
            status: 400
        })
    }

    try {
        const cards = await prisma.collectionEntry.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                userId: true,
                cardId: true,
                variant: true,
                condition: true,
                card: {
                    select: {
                        setId: true,
                        dexId: true
                    }
                },
                forTrade: true,
                showcase: true,
                grade: true,
                gradeLevel: true,
                tags: true
            }
        })
        return new Response(JSON.stringify({ cards }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Internal Server Error: ' + error }),
            {
                status: 500
            }
        )
    }
}
