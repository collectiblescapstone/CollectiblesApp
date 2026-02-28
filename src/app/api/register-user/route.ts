import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const POST = async (request: Request) => {
    const { id, email, username, firstName, lastName } = await request.json()

    try {
        const checkUserExists = await supabaseAdmin.auth.admin.getUserById(id)

        if (!checkUserExists.data) {
            return new Response(
                JSON.stringify({ error: 'User not found in Supabase Auth' }),
                {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        await prisma.user.create({
            data: { id, email, username, firstName, lastName }
        })

        return new Response(
            JSON.stringify({ message: 'User registered successfully' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    } catch (error) {
        await prisma.user.delete({ where: { id, email } })
        await supabaseAdmin.auth.admin.deleteUser(id)

        return new Response(
            JSON.stringify({ error: 'Internal Server Error', message: error }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}
