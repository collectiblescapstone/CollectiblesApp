import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import prisma from '@/lib/prisma'
import { ReportFormValues } from '@/types/user-management'

export const POST = async (request: NextRequest) => {
    try {
        const payload: {
            reqUserId: string
            reportedUserId: string
        } & ReportFormValues = await request.json()
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

        if (payload.reqUserId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized - user ID mismatch' },
                { status: 401 }
            )
        }
        if (userId === payload.reportedUserId) {
            return NextResponse.json(
                { error: 'Users cannot report themselves' },
                { status: 400 }
            )
        }

        const hasAtLeastOneCheckbox =
            payload.isVerbalAbuse ||
            payload.isSpamming ||
            payload.isHarassment ||
            payload.isScamming ||
            payload.isBadName ||
            payload.isBadBio
        if (
            !hasAtLeastOneCheckbox ||
            payload.reason.length < 10 ||
            payload.reason.length > 240
        ) {
            return NextResponse.json(
                {
                    error: 'Please select at least one report type and provide a reason (between 10 and 240 characters)'
                },
                { status: 400 }
            )
        }

        // Check if the report already exists
        const existingReport = await prisma.reportedUser.findFirst({
            where: {
                reporterId: userId,
                reportedUserId: payload.reportedUserId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Check if the user has already reported this user within the last 72 hours
        if (existingReport) {
            const timeDiff = Date.now() - existingReport.createdAt.getTime()
            const hoursDiff = timeDiff / (1000 * 60 * 60)
            if (hoursDiff < 72) {
                return NextResponse.json(
                    {
                        error: 'You have already reported this user. Please wait while we review your previous report.'
                    },
                    { status: 400 }
                )
            }
        }

        await prisma.reportedUser.create({
            data: {
                reporterId: userId,
                reportedUserId: payload.reportedUserId,
                isVerbalAbuse: payload.isVerbalAbuse,
                isSpamming: payload.isSpamming,
                isHarassment: payload.isHarassment,
                isScamming: payload.isScamming,
                isBadName: payload.isBadName,
                isBadBio: payload.isBadBio,
                reason: payload.reason
            }
        })

        return NextResponse.json({ message: 'User reported successfully' })
    } catch (error) {
        console.error('Error in report-user API:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
