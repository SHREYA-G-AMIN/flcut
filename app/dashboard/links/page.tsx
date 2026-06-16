import { db } from "@/db";
import { links } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CreateLinkForm } from "../_components/CreateLinkForm";
import { LinksTable } from "../_components/LinksTable";
import "./links.css";

// Prevent stale server component data cache
export const dynamic = "force-dynamic";

async function getLinks() {
  return db
    .select()
    .from(links)
    .orderBy(desc(links.createdAt));
}

export default async function LinksPage() {
  const allLinks = await getLinks();

  return (
    <div className="links-page">
      <div className="links-header">
        <div>
          <h1 className="overview-title">Links</h1>
          <p className="overview-sub">Create and manage your short URLs</p>
        </div>
      </div>

      <CreateLinkForm />

      <LinksTable links={allLinks} />
    </div>
  );
}
