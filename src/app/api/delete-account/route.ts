import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export const DELETE = async (request: Request) => {
    try {
        // Verify authentication
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

        // Delete all user-related data in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete collection entries
            await tx.collectionEntry.deleteMany({
                where: { userId }
            })

            // Delete wishlist entries
            await tx.wishlistEntry.deleteMany({
                where: { userId }
            })

            // Delete block lists where user is the blocker or blocked
            await tx.blockList.deleteMany({
                where: {
                    OR: [{ userId }, { blockedUserId: userId }]
                }
            })

            // Delete reports where user is the reporter or reported
            await tx.reportedUser.deleteMany({
                where: {
                    OR: [{ reporterId: userId }, { reportedUserId: userId }]
                }
            })

            // Finally, delete the user
            await tx.user.delete({
                where: { id: userId }
            })
        })

        // Delete the user from Supabase Auth
        const { error: authDeleteError } =
            await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authDeleteError) {
            console.error('Error deleting auth user:', authDeleteError)
            // Continue anyway - database user is already deleted
            // This is logged but not returned as an error to the client
        }

        return NextResponse.json(
            { message: 'Account deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting account:', error)
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message:
                    error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
