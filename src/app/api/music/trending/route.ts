import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY .env.local mein set nahi hai" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const genre = searchParams.get("genre")?.trim();

  const allowedGenres = [
    "EDM",
    "Pop",
    "Indie",
    "Hip-Hop",
    "R&B",
    "Rock",
    "Phonk",
    "Lo-fi",
    "Latin",
    "K-pop",
    "Afrobeats",
    "House",
    "Techno",
    "Trance",
    "Jazz",
    "Classical",
    "Reggae",
    "Country",
    "Acoustic",
    "Funk",
    "Metal",
    "Ambient",
    "Gaming",
    "Drum & Bass",
    "Deep House",
  ];

  if (!genre || !allowedGenres.includes(genre)) {
    return NextResponse.json(
      { error: "Valid genre required", allowedGenres },
      { status: 400 }
    );
  }

  try {
    const query = `${genre} popular music official music video`;

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("videoCategoryId", "10");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("maxResults", "25");
    url.searchParams.set("order", "viewCount");
    url.searchParams.set("q", query);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API error:", data);
      return NextResponse.json(
        { error: "YouTube API request failed", details: data.error?.message },
        { status: response.status }
      );
    }

    const songs = (data.items ?? []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ??
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url,
      genre,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return NextResponse.json(
      { genre, count: songs.length, songs },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Music API error:", error);
    return NextResponse.json(
      { error: "Unable to fetch music right now" },
      { status: 500 }
    );
  }
}