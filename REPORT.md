# Sydney Events Aggregator (MERN) — Brief Report

## 1. Overview
This project is a MERN-stack “Sydney Events Aggregator” platform that collects events from multiple public sources, normalizes and stores them in MongoDB, and displays them in a minimal frontend UI. It also includes Google OAuth for admin access and an admin dashboard for reviewing and importing scraped events. 

An optional extension was implemented: a Telegram-based recommendation assistant integrated with Ollama + LangChain. The assistant supports preference collection and event recommendations, and includes fallback behavior when local LLM/vector operations are unavailable or slow.

## 2. Tech Stack
- **Frontend:** React (Vite), TailwindCSS, Axios, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** Google OAuth 2.0 via Passport.js + cookie sessions (connect-mongo)
- **Scraping:** Axios + Cheerio + JSON-LD parsing (where available)
- **Scheduling:** node-cron
- **Optional assistant:** Telegram Bot API, LangChain JS, Ollama (local)

## 3. Data Model (high-level)
- **Event**
  - Key fields: `title`, `description`, `shortSummary`, `dateTime`, `venueName`, `venueAddress`, `city`, `category[]`, `imageUrl`, `sourceName`, `sourceUrl`, `status`, `lastScrapedAt`, `importedAt`, `importedBy`, `importNotes`
  - Indexing: unique index on `sourceUrl` to avoid duplicates
- **TicketClick**
  - Stores ticket modal submissions (email/consent + event reference) and is used before redirecting users to the source site.
- **User**
  - Google OAuth user record
- **UserPreference** (optional assistant)
  - Stores Telegram `chatId`, preference state machine step, preferences (genre/budget/dateTime/location/crowd), and `lastNotifiedAt`.

## 4. Scraping & Update Strategy
### Sources
Multiple public event sources are scraped (e.g., Eventbrite/Meetup/TimeOut). The scrapers are written to prioritize structured data:
- **JSON-LD first:** attempts to parse JSON-LD blocks for more stable extraction
- **HTML fallback:** uses Cheerio selectors if JSON-LD is missing or incomplete

### Normalization
Each source event is mapped into the unified `Event` schema. The `sourceName` and `sourceUrl` fields preserve provenance.

### Change detection
On each scrape run:
- Existing events (matched by `sourceUrl`) are updated if changes are detected and may be marked `updated`.
- Newly discovered events are inserted with `new` status.
- Events no longer found can be marked as `inactive` depending on scrape coverage.

## 5. Backend API & Admin Workflow
### Public API
- Serves event lists for the homepage.
- Ticket-click endpoint saves the user’s email/consent and then the frontend redirects to the event’s original ticket page.

### Auth
- Google OAuth login implemented via Passport.js.
- Session-based auth stored in MongoDB using `connect-mongo`.

### Admin dashboard
- Protected routes require authentication.
- Admin features include:
  - Filtering/searching events
  - Previewing event details
  - Import action (marks status as `imported` and stores import metadata)

## 6. Automation
- A cron schedule periodically runs the scrape job.
- Scrape runs once at server startup to help populate data quickly.

## 7. Optional: Telegram Recommendation Assistant (Ollama + LangChain)
### User experience
- `/start` introduces the assistant.
- `/prefs` collects preferences step-by-step and persists them.
- `/recommend` returns event suggestions.

### Retrieval approach
- Fetches up to a bounded number of active (non-inactive) events.
- Builds an in-memory vector store (LangChain `MemoryVectorStore`) using Ollama embeddings (default: `nomic-embed-text`).
- Runs similarity search against the preference query.

### Response formatting
- If a chat LLM is configured and installed in Ollama, it rewrites the response concisely.
- If the chat model is missing or fails, the system returns a structured plain-text list.

### Resilience and fallback
To keep the bot responsive:
- Timeouts are used for embedding/vector operations.
- If embedding/vector search times out, it falls back to:
  - keyword match (if possible)
  - otherwise returns recent events as a safe baseline

## 8. Known Limitations / Trade-offs
- **Scraping stability:** upstream HTML changes can affect extraction; JSON-LD reduces but doesn’t eliminate this risk.
- **Vector performance:** embedding large numbers of events can be slow on some machines; timeouts/fallback behavior is included to prevent the bot from hanging.
- **Chat model dependency:** if a chat model (e.g., `llama3.*`) is not installed in Ollama, LLM-style rewriting is unavailable; fallback still provides useful results.

## 9. Conclusion
The application satisfies the core requirements: multi-source event ingestion, normalization, persistent storage, minimal UI for browsing and ticket redirection, Google OAuth-protected admin dashboard with import workflow, and scheduled updates. The optional Telegram assistant is implemented end-to-end with robust fallback behavior to ensure reliability under local model constraints.
