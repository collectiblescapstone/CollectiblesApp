import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Subset } from '@prisma/client'

export const dynamic = 'force-static'

export async function GET() {
    try {
        const specifiedSubsets: Subset[] = await prisma.subset.findMany({})
        return NextResponse.json(specifiedSubsets)
    } catch (err) {
        console.error('Fetch error:', err)
        return NextResponse.json(
            { error: 'Failed to fetch subsets' },
            { status: 500 }
        )
    }
}
