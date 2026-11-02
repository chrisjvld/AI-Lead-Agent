Scout

AI lead research and outreach, from a CSV to a qualified, ready-to-contact list.

Upload a list of prospects. Scout visits each company's website, works out what they do, scores how well they match your ideal customer, and drafts a short personalised opener based on something specific from their site. You review the results, edit the messages, approve the leads worth contacting and export them.

Independent portfolio project by Christoffer Jamvold-Hughes. Built to demonstrate a full-stack AI automation workflow end to end.

What it does
Import a CSV with company, website, contact_name, title and email. Each row is validated before anything runs.
Research. Scout fetches each company's homepage and extracts the readable text.
Score. An LLM rates the company from 0 to 100 against a fixed ideal customer profile and explains why, using only evidence from the website.
Draft. It writes a one- or two-sentence opener that references a real detail from the site.
Review. The leads table updates live as the queue runs. Open any lead to read the summary, see the reasoning behind its score, and edit the opener.
Export approved leads to CSV, ready for your outreach tool.
Fit tiers
Score	Fit
70–100	Strong
40–69	Good
0–39	Weak

The default profile is a B2B service company with roughly 10–200 employees, a sales team and a clear offer on its website. B2C brands, large enterprises and vague websites score lower. The criteria live in the system prompt in lib/pipeline.ts and are listed on the app's Scoring rules page.

Tech stack
Next.js 16 (App Router) and React 19, written in TypeScript
Tailwind CSS 4 with design tokens in app/globals.css
OpenAI API with structured outputs, validated by Zod
SQLite via Drizzle ORM and better-sqlite3
Cheerio for HTML parsing, PapaParse for CSV import and export
How it works
CSV upload ──► validate rows (Zod) ──► SQLite (status: queued)
                                          │
                              background queue, one lead at a time
                                          │
                 fetch homepage ──► extract text ──► LLM (structured output)
                                                          │
                          summary · industry · size · score · reasons · opener
                                          │
                     SQLite (status: done / failed) ◄── UI polls every 2s

A few design decisions:

One LLM entry point. Every model call goes through structured() in lib/llm.ts, which returns a Zod-validated object. Swapping models or providers means changing one file.
Failures stay contained. A website that times out (10 s) or blocks the request marks that lead as failed with a reason, and the queue moves on.
Grounded output. The prompt only allows claims backed by the homepage text, and website content is treated as source material, never as instructions.
Bounded input. Only the first 4,000 characters of visible homepage text are sent, which keeps cost and latency predictable.
Running it locally

You need Node.js 20 or newer and an OpenAI API key.

bash
git clone https://github.com/chrisjvld/AI-Lead-Agent.git
cd AI-Lead-Agent/lead-research
npm install

Create lead-research/.env.local:

OPENAI_API_KEY=sk-...
OPENAI_MODEL=your-model-id

Create the database and start the app:

bash
npm run db:push
npm run dev

Open http://localhost:3000, go to Import and choose Try it with sample data. The sample file (seed/sample_leads.csv) contains 20 public company websites with invented contact names and example.com emails, including a few deliberate poor fits so the scoring is visible.

To test the research step on a single website from the terminal:

bash
npx tsx scripts/try-one.ts https://example.com

To clear all leads and start fresh:

bash
curl -X POST http://localhost:3000/api/reset
API
Method	Route	Purpose
GET	/api/leads	List all leads
POST	/api/leads/upload	Import a CSV and start the queue
GET	/api/leads/:id	Get one lead
PATCH	/api/leads/:id	Update the opener or approval
GET	/api/leads/export	Download approved leads as CSV
POST	/api/reset	Delete all leads
Project structure
lead-research/
  app/
    leads/            leads table and lead drawer
    upload/           CSV import
    scoring-rules/    the ideal customer profile
    api/              route handlers
  components/         UI components (table, drawer, shell, buttons)
  hooks/useLeads.ts   fetching and live polling
  lib/
    llm.ts            structured() wrapper around the OpenAI API
    pipeline.ts       fetch, extract, score, draft, and the queue
    schema.ts         Drizzle table definition
    types.ts          Zod schemas shared by the API and UI
  scripts/try-one.ts  run the pipeline on one URL
  seed/               sample CSV
Scope

Scout is a working demo, not a hosted product. It runs locally, has no authentication, reads only each company's homepage and does not send emails. A production version would add a persistent job queue, multi-page research, contact enrichment and email verification, and a direct handoff to an outreach tool.
