# flcut — Modern Short-Link Manager & Analytics

## About the Project
**flcut** is a URL shortener built for Finite Loop Club Events.
The goal was not just to shorten links but also to make them easier to manage during events.

---

## Tech Stacks 
- Next.js (App Router)
- TypeScript
- PostgreSQL (Neon)
- Drizzle ORM
- Tailwind CSS
- Recharts

---

### Data Model

I designed the database around two main entities : Links and Analytics.
 
 ### Links Table

 The Links table stores all the information required for redirection and link management.

 Some important fields are :
 - slug (short URL identifier)
 - longUrl (destination URL)
 - fallbackUrl
- goLiveAt
- expiresAt
- clickLimit
- isActive

Each record represents one shortened link.

### Analytics Table

The analytics table stores information about every click on a link.

Some important fields are:
- linkId
- visitorHash
- device
- referrer
- createdAt

Each analytics record belongs to a specific link through the linkId field.

### Relationship

The relationship is one-to-many.

One link can have many analytics records because a single link may be clicked hundreds or thousands of times

### Why I chose this design

I separated link data and analytics data because they have different purposes.

The Links table contains configuration data that changes rarely while Analytics table continuously grows as users clicks links.

Keeping them separate makes queries simpler and prevents the main link records from becoming overloaded with tracking data.

It also makes future scaling earier because analytics data can grow much faster than link data.

## If i had only 4 hours

I would focus on the core functionality first :

1. Create short links
2. Redirect users correctly 
3. Store links in PostgreSQL
4. Show links on a dashboard

Things I would cut:
- Analytics charts
- Click limits
- Go-live scheduling
- Device and referrer tracking

My priority would be tomake sure the basic link shortening workflow works reliably before adding extra features.

## Tradeoff I made

For unique click tracking i used a hash of the visitor IP and user agent instead of storing the actual IP address.

The advantage is better privacy.

The downside is that it is not a perfect way to identify uses because different people can similar network enviroments.

I felt this was a resonable compromise for the project.

## Assumptions

The PRD intentionally left some decisions open, so I made the following assumptions:

- A unique click is identified using a hashed IP + User Agent combination.
- Reserved words such as "dashboard", "api", and "links" cannot be used as aliases.
- If no custom alias is provided, a random short code is generated.
- Analytics data remains available even after a link expires.
- Authentication was not added because I treated this as an internal club tool and wanted to focus on the core requirements first.

## What I Learned

This project helped me understand:

- URL routing in Next.js
- Database design with PostgreSQL
- Using Drizzle ORM
- Handling redirects
- Tracking analytics events
- Thinking about tradeoffs instead of only writing code