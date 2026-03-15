import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

type CardFromFile = {
    id: string
    name: string
    types?: string[]
    category: string
    illustrator: string | null
    rarity: string
    set: {
        id: string
        name: string
    }
    variants?: { [key: string]: boolean }
    variants_detailed?: {
        type: string
        size?: string
    }[]
    dexId: number[] | null
    image: string
}

type SetFromFile = {
    id: string
    name: string
    serie?: {
        name: string
    }
    logo?: string
    symbol?: string
    cardCount: {
        official: number
        total: number
    }
}

async function main() {
    console.log('Start seeding process...')

    const dataPath = path.join(process.cwd(), 'public', 'temporary_card_data')

    // -------------------------
    // Seed Sets
    // -------------------------

    console.log('Seeding sets...')

    const setsPath = path.join(dataPath, 'sets.json')
    const setsFileContents = fs.readFileSync(setsPath, 'utf-8')

    const allSetsFromFile: SetFromFile[] = JSON.parse(setsFileContents)

    const setList = allSetsFromFile.map((set) => ({
        id: set.id,
        name: set.name,
        series: set.serie?.name || 'Other',
        logo: set.logo || '',
        symbol: set.symbol || '',
        official: set.cardCount.official,
        total: set.cardCount.total
    }))

    for (const set of setList) {
        await prisma.set.upsert({
            where: { id: set.id },
            update: set,
            create: set
        })
    }

    console.log(`Processed ${setList.length} sets.`)

    // -------------------------
    // Load card files
    // -------------------------

    console.log('Reading card files...')

    const allCards: CardFromFile[] = []

    const cardFilenames = fs
        .readdirSync(dataPath)
        .filter((f) => f.endsWith('.json') && f !== 'sets.json')

    console.log(`Found ${cardFilenames.length} card data files.`)

    for (const filename of cardFilenames) {
        const filePath = path.join(dataPath, filename)

        console.log(`Reading ${filename}...`)

        const fileContents = fs.readFileSync(filePath, 'utf-8')
        const parsedJson = JSON.parse(fileContents)

        if (parsedJson.cards && Array.isArray(parsedJson.cards)) {
            allCards.push(...parsedJson.cards)
        }
    }

    console.log(`Total cards loaded: ${allCards.length}`)

    const validCards = allCards.filter((card) => card?.set?.id)

    console.log(`Valid cards: ${validCards.length}`)

    // -------------------------
    // Normalize card data
    // -------------------------

    const normalizedCards = validCards.map((card) => {
        let cardVariants: string[] = []

        if (card.variants_detailed && card.variants_detailed.length > 0) {
            cardVariants = card.variants_detailed.map((v) => v.type)
        } else if (card.variants) {
            cardVariants = Object.keys(card.variants).filter(
                (key) => card.variants?.[key]
            )
        }

        // remove duplicates + stable ordering
        cardVariants = [...new Set(cardVariants)].sort()

        return {
            id: card.id,
            name: card.name ?? '',
            category: card.category ?? '',
            types: card.types ?? [],
            illustrator: card.illustrator ?? 'Unknown',
            rarity: card.rarity ?? '',
            variants: cardVariants,
            dexId: card.dexId ?? [],
            setId: card.set.id,
            image_url: `${card.image}/low.png`
        }
    })

    // -------------------------
    // Insert new cards
    // -------------------------

    console.log('Creating new cards with createMany...')

    await prisma.card.createMany({
        data: normalizedCards,
        skipDuplicates: true
    })

    console.log('Initial insert complete.')

    // -------------------------
    // Update existing cards
    // -------------------------

    console.log('Updating existing cards...')

    const batchSize = 100
    let updated = 0

    for (let i = 0; i < normalizedCards.length; i += batchSize) {
        const batch = normalizedCards.slice(i, i + batchSize)

        await Promise.all(
            batch.map((card) =>
                prisma.card.updateMany({
                    where: { id: card.id },
                    data: {
                        name: card.name,
                        category: card.category,
                        types: { set: card.types },
                        illustrator: card.illustrator,
                        rarity: card.rarity,
                        variants: { set: card.variants },
                        dexId: { set: card.dexId },
                        setId: card.setId,
                        image_url: card.image_url
                    }
                })
            )
        )

        updated += batch.length

        console.log(
            `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
                normalizedCards.length / batchSize
            )}`
        )
    }

    console.log(`Updated ${updated} cards.`)

    console.log('Seeding complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
