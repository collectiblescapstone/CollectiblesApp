import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
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
        const { data, error: authError } = await supabase.auth.getUser(token)

        if (authError || !data.user) {
            return NextResponse.json(
                { error: 'Unauthorized - invalid token' },
                { status: 401 }
            )
        }

        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Only allow users to clean up their own failed auth
        if (data.user.id !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized - cannot delete other users' },
                { status: 403 }
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
