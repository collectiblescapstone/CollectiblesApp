import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { Set } from '@prisma/client'

export const dynamic = 'force-static'

export async function GET() {
    try {
        const specifiedSets: Set[] = await prisma.set.findMany({})
        return NextResponse.json(specifiedSets)
    } catch (err) {
        console.error('Fetch error:', err)
        return NextResponse.json(
            { error: 'Failed to fetch sets' },
            { status: 500 }
        )
    }
}
