import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FormValues } from '@/types/personal-profile';

export const dynamic = 'force-static';

// PATCH /api/profile
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id: identifier,
      firstName,
      lastName,
      username,
      bio,
      location,
      instagram,
      x,
      facebook,
      whatsapp,
      discord,
      profilePic,
      visibility,
    } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Missing identifier (id)' },
        { status: 400 }
      );
    }

    const data: Partial<
      Omit<FormValues, 'profilePic'> & { profile_pic?: number }
    > = {};

    // name in the form maps to username in DB
    if (typeof firstName === 'string') data.firstName = firstName;
    if (typeof lastName === 'string') data.lastName = lastName;
    if (typeof username === 'string') data.username = username;
    if (typeof bio === 'string') data.bio = bio;
    if (typeof location === 'string') data.location = location;
    if (typeof instagram === 'string') data.instagram = instagram;
    if (typeof x === 'string') data.x = x;
    if (typeof facebook === 'string') data.facebook = facebook;
    if (typeof whatsapp === 'string') data.whatsapp = whatsapp;
    if (typeof discord === 'string') data.discord = discord;
    if (typeof profilePic === 'number') data.profile_pic = profilePic;
    if (typeof visibility === 'string') data.visibility = visibility;

    const updated = await prisma.user.update({
      where: { id: identifier },
      data,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error('Error updating profile', err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
