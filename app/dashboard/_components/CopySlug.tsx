"use client";

import { useState } from "react";

export function CopySlug({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const textBlob = new Blob([url], { type: "text/plain" });
      const htmlBlob = new Blob([`<a href="${url}">${url}</a>`], { type: "text/html" });
      const data = [
        new ClipboardItem({
          "text/plain": textBlob,
          "text/html": htmlBlob,
        }),
      ];
      navigator.clipboard.write(data).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback for browsers that don't support custom ClipboardItem types fully
        navigator.clipboard.writeText(url).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      });
    } catch {
      // General fallback
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="link-copier-container">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="copy-url-link"
        title="Open short link in new tab"
      >
        <span>{url.replace("https://", "").replace("http://", "")}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="external-icon"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
      <button className="copy-action-btn" onClick={copy} title="Copy link to clipboard">
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}