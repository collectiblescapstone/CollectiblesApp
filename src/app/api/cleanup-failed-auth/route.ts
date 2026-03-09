import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Delete the user from Supabase Auth using admin client
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (error) {
            console.error('Error deleting auth user:', error)
            return NextResponse.json(
                { error: 'Failed to delete auth user', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { message: 'Auth user deleted successfully' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error in cleanup-failed-auth:', error)
        return NextResponse.json(
            { error: 'Internal Server Error', message: error },
            { status: 500 }
        )
    }
}
