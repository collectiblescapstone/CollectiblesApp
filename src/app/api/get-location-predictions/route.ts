import { NextRequest, NextResponse } from 'next/server';
import { GeoLocation, GeoFeature } from '@/types/geolocation';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: 'Query must be at least 3 characters' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        query
      )}&limit=5&apiKey=${process.env.GEOAPIFY_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`);
    }

    const data = await response.json();

    const places: GeoLocation[] =
      data.features?.map((f: GeoFeature) => ({
        formatted: f.properties.formatted,
        lat: f.properties.lat,
        lon: f.properties.lon,
      })) || [];

    return NextResponse.json({ predictions: places }, { status: 200 });
  } catch (error) {
    console.error('Location prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location predictions' },
      { status: 500 }
    );
  }
}
