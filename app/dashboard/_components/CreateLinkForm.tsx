"use client";

import { useActionState, useState } from "react";
import { createLink } from "../links/actions";

const initialState = { error: undefined as string | undefined, success: false, slug: "" };

export function CreateLinkForm() {
  const [state, formAction, pending] = useActionState(createLink, initialState);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="create-card">
      <div className="create-card-header">
        <span className="create-title">Create a link</span>
      </div>

      <form action={formAction} className="create-form">
        {/* URL row */}
        <div className="form-row form-row--main">
          <div className="field">
            <label className="field-label" htmlFor="longUrl">Destination URL</label>
            <input
              id="longUrl"
              name="longUrl"
              type="url"
              placeholder="https://docs.google.com/forms/..."
              className="field-input"
              required
            />
          </div>

          <div className="field field--slug">
            <label className="field-label" htmlFor="slug">
              Custom alias <span className="field-optional">optional</span>
            </label>
            <div className="slug-input-wrap">
              <span className="slug-prefix">flcut/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="hackfest26"
                className="field-input slug-input"
                pattern="[a-z0-9-]*"
              />
            </div>
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? "▾" : "▸"} Schedule &amp; expiry
        </button>

        {showAdvanced && (
          <div className="form-row form-row--advanced">
            <div className="field">
              <label className="field-label" htmlFor="goLiveAt">Go live at</label>
              <input
                id="goLiveAt"
                name="goLiveAt"
                type="datetime-local"
                className="field-input"
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="expiresAt">Expires at</label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                className="field-input"
              />
            </div>
          </div>
        )}

        {/* Feedback */}
        {state?.error && (
          <p className="form-error">{state.error}</p>
        )}
        {state?.success && (
          <p className="form-success">
            Created — <code>flcut/{state.slug}</code>
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Creating…" : "Create link"}
        </button>
      </form>
    </div>
  );
}