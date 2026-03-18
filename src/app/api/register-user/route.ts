import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { Filter } from 'bad-words'

const filter = new Filter()

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

        const profanityCheck = [
            {
                field: 'firstName',
                value: firstName
                    .toLowerCase()
                    .replace(/[^a-z]/g, ' ')
                    .replace(/(.)\1+/g, '$1')
            },
            {
                field: 'lastName',
                value: lastName
                    .toLowerCase()
                    .replace(/[^a-z]/g, ' ')
                    .replace(/(.)\1+/g, '$1')
            },
            {
                field: 'username',
                value: username
                    .toLowerCase()
                    .replace(/[^a-z]/g, ' ')
                    .replace(/(.)\1+/g, '$1')
            }
        ]

        for (const { field, value } of profanityCheck) {
            if (filter.isProfane(value)) {
                return new Response(
                    JSON.stringify({
                        error: `Profanity detected in ${field}, please remove it.`
                    }),
                    {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    }
                )
            }
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
