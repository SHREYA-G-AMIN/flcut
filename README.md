# flcut — Modern Short-Link Manager & Analytics

**flcut** is a simple, beautiful, and private short-link manager. It lets you create custom short links (like `flcut/hackfest26`), schedule when they go live, set expiration dates, set click limits, and view detailed traffic analytics.

---

## 🌟 Key Features

* **Custom Link Shortening**: Create clean short links with custom names (aliases).
* **Smart Scheduling**: Set a start date ("go live") and an expiration date for your links.
* **Click Limits**: Set a maximum number of clicks. Once reached, the link automatically stops working or redirects to a fallback link.
* **Fallbacks**: Redirect users to an alternative fallback URL when a link is expired or full.
* **Visual Analytics**: Beautiful graphs showing total clicks, unique visitors, referral traffic, and device breakdowns.
* **Privacy-Friendly**: Uses secure hashes to count unique visitors without storing raw IP addresses.

---

## 🛠️ Tech Stack

* **Framework**: Next.js (App Router, React server components)
* **Styling**: Tailwind CSS v4 and vanilla CSS variables
* **Database**: Neon (Serverless PostgreSQL)
* **Database Tool**: Drizzle ORM
* **Charts**: Recharts (fully aligned with light and dark modes)

---

## 🔍 How the Live Demo Works Behind the Scenes

Here is exactly what happens when you create, click, and track a short link in **flcut**:

```mermaid
sequenceDiagram
    actor User as Visitor
    actor Creator as Link Creator
    participant Server as Next.js Server
    participant DB as Neon Postgres DB
    participant Target as Destination Website

    Creator->>Server: Create Link Form (slug, destination, limits)
    Server->>DB: Save link details to "links" table
    Note over User, Target: Later, when a visitor clicks the link
    User->>Server: Access flcut.finiteloop.club/hackfest26
    Server->>DB: Fetch link metadata for slug "hackfest26"
    DB-->>Server: Return active status, limits, and URLs
    Note over Server: Server checks limits & dates
    alt Link is Expired or Click Limit Reached
        Server->>User: Redirect to Fallback URL or show 410 Error
    else Link is Valid
        Note over Server: Gather User Agent & Referrer header
        Server->>Server: Hash (IP + User Agent) to create visitor ID
        Server->>DB: Save click log to "analytics" table
        Server->>User: HTTP 308 Redirect + Cache-Control: no-cache
        User->>Target: Land on Destination URL
    end
```

### Step 1: You Create the Link
1. You fill out the form on the dashboard. You enter the long URL (destination) and a custom alias (slug), such as `hackfest26`. You can also set click limits, fallback links, or go-live and expiration dates.
2. When you click **Create Link**, a Next.js Server Action (`createLink`) runs. It checks if the alias is valid and not taken.
3. The server writes a new row containing these settings to the `links` table in the Neon PostgreSQL database using Drizzle ORM.

### Step 2: A Visitor Clicks the Link
1. A visitor enters or clicks `http://localhost:3000/hackfest26`.
2. Next.js routes this request to the dynamic catch-all route handler inside [app/\[slug\]/route.ts](file:///c:/Users/shrey/OneDrive/Desktop/Open%20Source/flcut/app/%5Bslug%5D/route.ts).

### Step 3: Server Validation & Security Guards
The server fetches the link configuration from the database and runs four checks:
* **Active Status**: Is the link paused? If yes, show a `404 Not Found` page.
* **Go-Live Date**: Has the event registration or link activation started? If it is too early, return a `403 Forbidden` page.
* **Expiration Date**: Is it past the link's end date? If expired, redirect the visitor to the fallback URL (if provided) or return a `410 Gone` page.
* **Click Limit**: How many clicks has this link received? The server counts the number of existing logs in the database. If the count is equal to or greater than the limit, redirect to the fallback URL (if provided) or return a `410 Gone` page.

### Step 4: Analytics Collection (Privacy-Safe)
If all checks pass, the server gathers details about the click:
1. **Device Identification**: It inspects the `User-Agent` header to check if the browser is on a Mobile, Tablet, or Desktop.
2. **Referrer Header**: It checks the `Referer` header to see where the visitor came from (like Twitter, GitHub, or a direct visit).
3. **Unique visitor hash**: To count unique visitors without storing sensitive personal info, it hashes the visitor's IP address and User Agent together into a short base64 string (e.g. `dXNlci1hZ2VudC1pcC1oYXNo`).
4. **Database Record**: It inserts a new log row into the `analytics` table.

### Step 5: Redirection (Why it does not cache)
1. The server generates an **HTTP 308 Permanent Redirect** response to send the visitor to their destination.
2. Crucially, the server appends the header: `Cache-Control: no-cache, no-store, must-revalidate`.
3. **Why this header is important**: Usually, web browsers cache permanent redirects. If a browser caches the redirect, the next time the same visitor clicks the link, their browser will jump directly to the destination without asking our server first. By forcing `no-cache`, the browser must contact our server on every single click, allowing us to record every single visitor click.

### Step 6: Visualizing the Data
1. When you open the dashboard page, Next.js fetches the database logs.
2. The server sums the clicks, groups them by day, device, and referrer, and calculates percentage shares.
3. The server feeds this clean data into our Recharts visualization code. The graphs automatically match light or dark mode styles depending on your system settings.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed on your system.

### 2. Install Dependencies
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Database Configurations
Create a `.env` file in the project root folder and add your Neon PostgreSQL database URL:
```env
DATABASE_URL="postgresql://user:password@endpoint/dbname?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Push Database Schema
Set up the tables in your database:
```bash
npx drizzle-kit push
```

### 5. Start the Development Server
Run the local dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application dashboard.
