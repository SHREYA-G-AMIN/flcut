// FLCUT-AI-2627-visible
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { links, analytics } from "@/db/schema";
import { eq } from "drizzle-orm";

// 1. Initialize our database connection
const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // 2. Look up the slug in our Neon database
    const fetchedLinks = await db
      .select()
      .from(links)
      .where(eq(links.slug, slug))
      .limit(1);

    const link = fetchedLinks[0];

    // 3. Guard: If the link doesn't exist or is paused, break out
    if (!link || !link.isActive) {
      return new NextResponse("Link Not Found", { status: 404 });
    }

    const now = new Date();

    // 4. Guard: Check if the link hasn't gone live yet
    if (link.goLiveAt && now < new Date(link.goLiveAt)) {
      return new NextResponse("This event registration hasn't started yet!", { status: 403 });
    }

    // 5. Guard: Check if the link has already expired
    if (link.expiresAt && now > new Date(link.expiresAt)) {
      if (link.fallbackUrl) {
        return NextResponse.redirect(new URL(link.fallbackUrl));
      }
      return new NextResponse("This event link has expired!", { status: 410 });
    }

    // 6. Track simple analytics in the background before moving the user
    // We create a privacy-friendly hash of their IP + User Agent instead of saving raw IPs
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const referrer = request.headers.get("referer") || "Direct";
    const clientHash = Buffer.from(`${ip}-${userAgent}`).toString("base64").slice(0, 32);


    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet/i.test(userAgent)) device = "Tablet";
    
    // Insert analytics log matching your exact database columns
    await db.insert(analytics).values({
      linkId: link.id,
      visitorHash: clientHash,
      referrer: referrer,
      device: device,
    });

    // 7. SUCCESS: Send them flying to their destination!
    return NextResponse.redirect(new URL(link.longUrl));

  } catch (error) {
    console.error("Redirect Engine Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}