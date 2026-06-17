// FLCUT-AI-2627-visible
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { links, analytics } from "@/db/schema";
import { eq, count } from "drizzle-orm";

// 1. Initialize our database connection
const sqlConnection = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlConnection);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // 2. Look up the slug in our Neon database
    const fetchedLinks = await db
      .select()
      .from(links)
      .where(eq(links.slug, slug))
      .limit(1);

    const link = fetchedLinks[0];

    // 3. Guard: If the link doesn't exist or is paused, break out to dashboard
    if (!link || !link.isActive) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const now = new Date();

    // 4. Guard: Check if the link hasn't gone live yet, fallback to dashboard
    if (link.goLiveAt && now < new Date(link.goLiveAt)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 5. Guard: Check if the link has already expired
    if (link.expiresAt && now > new Date(link.expiresAt)) {
      if (link.fallbackUrl) {
        const response = NextResponse.redirect(new URL(link.fallbackUrl), 308);
        response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        return response;
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 5b. Guard: Check click limits if configured
    if (link.clickLimit !== null) {
      const [clicksCountResult] = await db
        .select({ count: count() })
        .from(analytics)
        .where(eq(analytics.linkId, link.id));

      if (clicksCountResult.count >= link.clickLimit) {
        if (link.fallbackUrl) {
          const response = NextResponse.redirect(new URL(link.fallbackUrl), 308);
          response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
          return response;
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // 6. Track simple analytics in the background before moving the user
    // We create a privacy-friendly hash of their IP + User Agent instead of saving raw IPs
    const xForwardedFor = request.headers.get("x-forwarded-for");
    const ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const referrer = request.headers.get("referer") || "Direct";
    const clientHash = Buffer.from(`${ip}-${userAgent}`).toString("base64").slice(0, 32);

    let device = "Desktop";
    if (/mobile/i.test(userAgent)) device = "Mobile";
    else if (/tablet/i.test(userAgent)) device = "Tablet";

    try {
      // Insert analytics log matching your exact database columns
      await db.insert(analytics).values({
        linkId: link.id,
        visitorHash: clientHash,
        referrer: referrer,
        device: device,
      });
    } catch (dbError) {
      // Ensure DB insert errors do not block the actual redirection event
      console.error("Failed to log analytics to database:", dbError);
    }

    // 7. SUCCESS: Send them flying to their destination!
    const response = NextResponse.redirect(new URL(link.longUrl), 308);
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;

  } catch (error) {
    console.error("Redirect Engine Error:", error);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}