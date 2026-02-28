//@ts-ignore
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

// Type for the card objects in your 'cards_*.json' files
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
    dexId: number[] | null
    image: string
}

// Type for the set objects in 'sets.json'
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
    console.log(`Start seeding process...`)
    const dataPath = path.join(process.cwd(), 'public', 'temporary_card_data')

    console.log('Seeding Sets from sets.json...')
    try {
        const setsPath = path.join(dataPath, 'sets.json')
        const setsFileContents = fs.readFileSync(setsPath, 'utf-8')
        const allSetsFromFile: SetFromFile[] = JSON.parse(setsFileContents)

        const setList = allSetsFromFile.map((set) => {
            return {
                id: set.id,
                name: set.name,
                series: set.serie?.name || 'Other', // Default to 'Other' if serie info is missing
                logo: set.logo || '', // Default to empty string if logo is missing
                symbol: set.symbol || '', // Default to empty string if symbol is missing
                official: set.cardCount.official,
                total: set.cardCount.total
            }
        })

        await prisma.set.createMany({
            data: setList,
            skipDuplicates: true
        })
        console.log(`Processed ${setList.length} sets.`)
    } catch (err) {
        console.error('Error reading sets.json:', err)
        console.error("Please make sure 'prisma/data/sets.json' exists.")
        return
    }

    console.log('Seeding Cards from all other JSON files...')
    const allCards: CardFromFile[] = []
    let cardFilenames: string[]

    try {
        // Get all card json files
        cardFilenames = fs
            .readdirSync(dataPath)
            .filter((f) => f.endsWith('.json') && f !== 'sets.json')

        console.log(`Found ${cardFilenames.length} card data files.`)
    } catch (err) {
        console.error('Error reading data directory:', err)
        return
    }

    for (const filename of cardFilenames) {
        console.log(`- Reading ${filename}...`)
        const filePath = path.join(dataPath, filename)
        const fileContents = fs.readFileSync(filePath, 'utf-8')
        const parsedJson = JSON.parse(fileContents)

        if (parsedJson.cards && Array.isArray(parsedJson.cards)) {
            allCards.push(...parsedJson.cards)
        } else {
            console.log(`Skipping ${filename} (no cards found).`)
        }
    }

    console.log(`Total cards found in all files: ${allCards.length}`)
    if (allCards.length === 0) {
        console.log('No cards to seed. Exitting.')
        return
    }

    const validCards = allCards.filter((card) => {
        if (!card.set || !card.set.id) {
            console.warn(
                `- Skipping card "${card.name}" (id: ${card.id}) - missing 'set' information.`
            )
            return false
        }
        return true
    })

    console.log(
        `Found ${validCards.length} valid cards with set information to process.`
    )

    console.log('Processing Cards')

    const batchSize = 1000
    for (let i = 0; i < validCards.length; i += batchSize) {
        const batch = validCards.slice(i, i + batchSize)

        // Map the batch to the Prisma schema
        const cardData = batch.map((card: CardFromFile) => {
            const cardVariants = card.variants
                ? Object.keys(card.variants).filter(
                      (key) => card.variants && card.variants[key] === true
                  )
                : []

            return {
                id: card.id,
                name: card.name,
                category: card.category,
                types: card.types || [],
                illustrator: card.illustrator ?? 'Unknown', // 'Unknown' if null
                rarity: card.rarity,
                variants: cardVariants,
                dexId: card.dexId || [],
                setId: card.set.id, // This links to the Set we seeded
                image_url: `${card.image}/low.png` // Construct low quality image URL
            }
        })

        // Insert the batch into the database
        const result = await prisma.card.createMany({
            data: cardData,
            skipDuplicates: true
        })
        console.log(
            `- Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validCards.length / batchSize)}. ${result.count} new cards added.`
        )
    }

    console.log(`Seeding finished.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
