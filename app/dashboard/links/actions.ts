"use server";

import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

// Match the state shape our form component expects
interface FormState {
  error?: string;
  success: boolean;
  slug?: string;
}

// Reserved slugs — never let these be claimed
const RESERVED = new Set([
  "admin", "api", "dashboard", "login", "logout",
  "register", "static", "favicon", "robots", "_next",
]);

function generateSlug() {
  return nanoid(6); // e.g. "aB3xQ2"
}

export async function createLink(prevState: FormState, formData: FormData): Promise<FormState> {
  const longUrl   = formData.get("longUrl") as string;
  const customSlug = (formData.get("slug") as string).trim().toLowerCase();
  const goLiveAt  = formData.get("goLiveAt") as string;
  const expiresAt = formData.get("expiresAt") as string;

  // ── Validation ────────────────────────────────────────────────
  if (!longUrl || !URL.canParse(longUrl)) {
    return { success: false, error: "Enter a valid URL." };
  }

  let slug = customSlug || generateSlug();

  if (RESERVED.has(slug)) {
    return { success: false, error: `"${slug}" is reserved. Pick a different alias.` };
  }

  // Slug format: lowercase letters, numbers, hyphens only
  if (customSlug && !/^[a-z0-9-]+$/.test(customSlug)) {
    return { success: false, error: "Alias can only contain letters, numbers, and hyphens." };
  }

  // ── Collision check ───────────────────────────────────────────
  const existing = await db
    .select({ id: links.id })
    .from(links)
    .where(eq(links.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    if (customSlug) {
      return { success: false, error: `"/${customSlug}" is already taken. Try a different alias.` };
    }
    // Auto-generated collision (rare but possible) — retry once
    slug = generateSlug();
  }

  // ── Insert ────────────────────────────────────────────────────
  await db.insert(links).values({
    longUrl,
    slug,
    goLiveAt:  goLiveAt  ? new Date(goLiveAt)  : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isActive: true,
  });

  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard");
  return { success: true, slug };
}

export async function toggleLink(id: string, isActive: boolean) {
  await db.update(links).set({ isActive }).where(eq(links.id, id));
  revalidatePath("/dashboard/links");
}

export async function deleteLink(id: string) {
  await db.delete(links).where(eq(links.id, id));
  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard");
}