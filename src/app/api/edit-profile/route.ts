import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { FormValues } from '@/types/personal-profile'
import { profanityChecker } from '@/utils/profanityCheck'

// PATCH /api/profile
export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized - missing token' },
                { status: 401 }
            )
        }
        const token = authHeader.substring(7)
        const { data: userData, error } = await supabase.auth.getUser(token)
        if (error || !userData.user) {
            return NextResponse.json(
                { error: 'Unauthorized - invalid token' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            id: identifier,
            firstName,
            lastName,
            username,
            bio,
            location,
            latitude,
            longitude,
            instagram,
            x,
            facebook,
            whatsapp,
            discord,
            profilePic,
            visibility
        } = body

        if (!identifier) {
            return NextResponse.json(
                { error: 'Missing identifier (id)' },
                { status: 400 }
            )
        }

        if (body.id !== userData.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const profanityCheck = [
            {
                field: 'firstName',
                value: firstName
            },
            {
                field: 'lastName',
                value: lastName
            },
            {
                field: 'username',
                value: username
            },
            {
                field: 'bio',
                value: bio
            }
        ]

        for (const { field, value } of profanityCheck) {
            if (typeof value === 'string' && profanityChecker(value)) {
                return NextResponse.json(
                    {
                        error: `Profanity detected in ${field}, please remove it.`
                    },
                    { status: 400 }
                )
            }
        }

        const data: Partial<
            Omit<FormValues, 'profilePic'> & { profile_pic?: number }
        > = {}

        // name in the form maps to username in DB
        if (typeof firstName === 'string') data.firstName = firstName
        if (typeof lastName === 'string') data.lastName = lastName
        if (typeof username === 'string') data.username = username
        if (typeof bio === 'string') data.bio = bio
        if (typeof location === 'string') data.location = location
        if (typeof latitude === 'number') data.latitude = latitude
        if (latitude === null) data.latitude = null
        if (typeof longitude === 'number') data.longitude = longitude
        if (longitude === null) data.longitude = null
        if (typeof instagram === 'string') data.instagram = instagram
        if (typeof x === 'string') data.x = x
        if (typeof facebook === 'string') data.facebook = facebook
        if (typeof whatsapp === 'string') data.whatsapp = whatsapp
        if (typeof discord === 'string') data.discord = discord
        if (typeof profilePic === 'number') data.profile_pic = profilePic
        if (typeof visibility === 'string')
            data.visibility = visibility as FormValues['visibility']

        const updated = await prisma.user.update({
            where: { id: identifier },
            data
        })

        return NextResponse.json({ success: true, user: updated })
    } catch (err) {
        console.error('Error updating profile', err)
        return NextResponse.json({ error: err }, { status: 500 })
    }
}
