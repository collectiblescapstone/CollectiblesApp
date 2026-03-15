import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ----------------------
// Types
// ----------------------

type CardFromFile = {
    id: string
    name: string
    types?: string[]
    category: string
    illustrator: string | null
    rarity: string
    set: { id: string; name: string }
    variants?: { [key: string]: boolean }
    variants_detailed?: { type: string; size?: string }[]
    dexId: number[] | null
    image: string
}

type SetFromFile = {
    id: string
    name: string
    serie?: { name: string }
    logo?: string
    symbol?: string
    cardCount: {
        official: number
        total: number
    }
}

type SubsetFromFile = {
    cardCount: number
    originalSet: string
    id: string
    subsetName: string
    prefix: string
}

// ----------------------
// Helpers
// ----------------------

function normalizeVariants(card: CardFromFile): string[] {
    let variants: string[] = []

    if (card.variants_detailed?.length) {
        variants = card.variants_detailed.map((v) => v.type)
    } else if (card.variants) {
        variants = Object.keys(card.variants).filter((k) => card.variants?.[k])
    }

    return [...new Set(variants)].sort()
}

// ----------------------
// Main
// ----------------------

async function main() {
    console.log('Starting seed...')

    const dataPath = path.join(process.cwd(), 'public', 'temporary_card_data')

    // =====================================================
    // SETS
    // =====================================================

    console.log('Loading sets...')

    const sets: SetFromFile[] = JSON.parse(
        fs.readFileSync(path.join(dataPath, 'sets.json'), 'utf8')
    )

    const normalizedSets = sets.map((set) => ({
        id: set.id,
        name: set.name,
        series: set.serie?.name || 'Other',
        logo: set.logo || '',
        symbol: set.symbol || '',
        official: set.cardCount.official,
        total: set.cardCount.total
    }))

    await prisma.set.createMany({
        data: normalizedSets,
        skipDuplicates: true
    })

    console.log(`Sets processed: ${normalizedSets.length}`)

    // =====================================================
    // SUBSETS
    // =====================================================

    console.log('Loading subsets...')

    const subsets: SubsetFromFile[] = JSON.parse(
        fs.readFileSync(path.join(dataPath, 'subsets.json'), 'utf8')
    )

    const normalizedSubsets = subsets.map((subset) => ({
        id: subset.id,
        setId: subset.originalSet,
        name: subset.subsetName,
        prefix: subset.prefix,
        official: subset.cardCount
    }))

    await prisma.subset.createMany({
        data: normalizedSubsets,
        skipDuplicates: true
    })

    console.log(`Subsets processed: ${normalizedSubsets.length}`)

    // =====================================================
    // LOAD CARD FILES
    // =====================================================

    console.log('Loading card files...')

    const filenames = fs
        .readdirSync(dataPath)
        .filter(
            (f) =>
                f.endsWith('.json') && f !== 'sets.json' && f !== 'subsets.json'
        )

    const allCards: CardFromFile[] = []

    for (const file of filenames) {
        const filePath = path.join(dataPath, file)

        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        if (Array.isArray(parsed.cards)) {
            allCards.push(...parsed.cards)
        }
    }

    console.log(`Total cards loaded: ${allCards.length}`)

    const validCards = allCards.filter((c) => c?.set?.id)

    console.log(`Valid cards: ${validCards.length}`)

    // =====================================================
    // NORMALIZE CARDS
    // =====================================================

    const normalizedCards = validCards.map((card) => ({
        id: card.id,
        name: card.name ?? '',
        category: card.category ?? '',
        types: card.types ?? [],
        illustrator: card.illustrator ?? 'Unknown',
        rarity: card.rarity ?? '',
        variants: normalizeVariants(card),
        dexId: card.dexId ?? [],
        setId: card.set.id,
        image_url: `${card.image}/low.png`
    }))

    // =====================================================
    // INSERT CARDS
    // =====================================================

    console.log('Inserting new cards...')

    await prisma.card.createMany({
        data: normalizedCards,
        skipDuplicates: true
    })

    console.log('Initial card insert complete.')

    // =====================================================
    // UPDATE CARDS
    // =====================================================

    console.log('Updating existing cards...')

    const batchSize = 100

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

        console.log(
            `Batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(
                normalizedCards.length / batchSize
            )}`
        )
    }

    console.log('Card updates complete.')

    console.log('Seed complete.')
}

// ----------------------

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
