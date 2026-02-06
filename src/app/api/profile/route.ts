import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-static';

// GET /api/profile?id=userId
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'No such user' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      username: true,
      email: true,
      bio: true,
      location: true,
      instagram: true,
      x: true,
      facebook: true,
      visibility: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Map DB fields to client FormValues shape (name -> username)
  return NextResponse.json({
    name: user.username ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    instagram: user.instagram ?? '',
    xit: user.x ?? '',
    facebook: user.facebook ?? '',
    visibility: user.visibility ?? 'Public',
    email: user.email ?? null,
  });
}

// PATCH /api/profile
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id: identifier,
      name,
      bio,
      location,
      instagram,
      twitter,
      facebook,
      visibility,
    } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Missing identifier (id)' },
        { status: 400 }
      );
    }

    const data: any = {};

    // name in the form maps to username in DB
    if (typeof name === 'string') data.username = name;
    if (typeof bio === 'string') data.bio = bio;
    if (typeof location === 'string') data.location = location;
    if (typeof instagram === 'string') data.instagram = instagram;
    if (typeof twitter === 'string') data.twitter = twitter;
    if (typeof facebook === 'string') data.facebook = facebook;
    if (typeof visibility === 'string') data.visibility = visibility;

    const updated = await prisma.user.update({
      where: { id: identifier },
      data,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('Error updating profile', err);
    return NextResponse.json(
      { error: err.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
