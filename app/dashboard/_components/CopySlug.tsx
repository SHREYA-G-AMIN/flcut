"use client";

import { useState } from "react";

export function CopySlug({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button className="copy-btn" onClick={copy}>
      <span className="copy-url">{url.replace("https://", "")}</span>
      <span className="copy-label">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}