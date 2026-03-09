import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
    const { id, email } = await request.json()
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - missing token' },
                { status: 401 }
            )
        }
        const token = authHeader.substring(7)
        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) {
            return NextResponse.json(
                { error: 'Unauthorized - invalid token' },
                { status: 401 }
            )
        }
        const userId = data.user.id
        if (id !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized - user ID mismatch' },
                { status: 401 }
            )
        }

        const tempUsername = email.split('@')[0] + '_' + id.split('-')[2]

        const checkUserExists = await prisma.user.findUnique({ where: { id } })
        if (checkUserExists) {
            return NextResponse.json(
                { message: 'User already exists', status: 'exists' },
                { status: 200 }
            )
        }

        await prisma.user.create({
            data: { id, email, username: tempUsername }
        })

        return NextResponse.json(
            { message: 'User registered successfully', status: 'created' },
            { status: 200 }
        )
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error', message: error },
            {
                status: 500
            }
        )
    }
}
