"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleLink, deleteLink } from "../links/actions";

type LinkRow = {
  id: string;
  slug: string;
  longUrl: string;
  isActive: boolean;
  goLiveAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date | null;
};

function getLinkStatus(link: LinkRow, now: Date) {
  if (!link.isActive) return { type: "inactive", label: "Inactive" };
  if (link.expiresAt && new Date(link.expiresAt) < now) return { type: "expired", label: "Expired" };
  if (link.goLiveAt && new Date(link.goLiveAt) > now) return { type: "scheduled", label: "Scheduled" };
  return { type: "active", label: "Active" };
}

export function LinksTable({ links }: { links: LinkRow[] }) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const now = new Date();

  const filtered = links.filter(
    (l) =>
      l.slug.includes(search.toLowerCase()) ||
      l.longUrl.toLowerCase().includes(search.toLowerCase())
  );

  if (links.length === 0) {
    return (
      <div className="empty-state">
        <p>No links yet. Create one above.</p>
      </div>
    );
  }

  return (
    <div className="table-section">
      <div className="table-toolbar">
        <input
          type="search"
          placeholder="Search by slug or URL…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input search-input"
        />
        <span className="table-count">
          {filtered.length} of {links.length}
        </span>
      </div>

      <div className="links-table-wrapper">
        <table className="links-table links-table--full">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((link) => {
              const status = getLinkStatus(link, now);
              return (
                <tr key={link.id}>
                  <td>
                    <span className="slug-chip">/{link.slug}</span>
                  </td>
                  <td>
                    <span className="dest-url" title={link.longUrl}>
                      {link.longUrl.length > 52
                        ? link.longUrl.slice(0, 52) + "…"
                        : link.longUrl}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${status.type}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="date-cell">
                    {link.expiresAt
                      ? new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(link.expiresAt))
                      : "—"}
                  </td>
                  <td className="date-cell">
                    {link.createdAt
                      ? new Intl.DateTimeFormat("en-IN", {
                          day: "numeric",
                          month: "short",
                        }).format(new Date(link.createdAt))
                      : "—"}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link
                        href={`/dashboard/links/${link.id}`}
                        className="row-action"
                      >
                        Analytics
                      </Link>
                      <button
                        className="row-action"
                        onClick={() =>
                          startTransition(() =>
                            toggleLink(link.id, !link.isActive)
                          )
                        }
                      >
                        {link.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="row-action row-action--danger"
                        onClick={() => {
                          if (confirm(`Delete /${link.slug}? This can't be undone.`))
                            startTransition(() => deleteLink(link.id));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}