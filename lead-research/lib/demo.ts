/**
 * DEMO MODE
 *
 * Lets Scout run end to end without an OpenAI key or network access, for
 * screenshots, screen recordings and first-time evaluation.
 *
 * - Enabled automatically when OPENAI_API_KEY is not set, or explicitly with
 *   DEMO_MODE=1. Force real mode with DEMO_MODE=0.
 * - Produces precomputed, hand-written results for the companies in
 *   seed/sample_leads.csv, and a neutral deterministic fallback for any other
 *   row. It never fetches websites and never calls a model.
 * - Walks each lead through research -> enrich -> score -> draft with
 *   simulated timing so the live UI behaves as it does in real mode.
 *
 * Nothing in here is used by the real pipeline. lib/pipeline.ts only decides
 * which processor to call.
 */
import type { LeadInsight, PipelineLead } from "@/lib/types";

export type DemoStage = "researching" | "enriching" | "scoring" | "drafting";

export function isDemoMode() {
  const flag = process.env.DEMO_MODE?.trim();
  if (flag === "1" || flag === "true") return true;
  if (flag === "0" || flag === "false") return false;
  return !process.env.OPENAI_API_KEY;
}

type DemoResult = Omit<LeadInsight, "tier">;

// Hand-written sample results, keyed by bare domain. Written to read like
// grounded model output for the sample list; they are illustrative, not
// verified research.
const SAMPLE_RESULTS: Record<string, DemoResult> = {
  "designjoy.co": {
    summary:
      "A subscription design service: clients pay a flat monthly fee and submit unlimited design requests, delivered one at a time.",
    industry: "Design services",
    sizeSignal: "Very small team; the site centres on a single founder-led offer.",
    score: 58,
    reasons: [
      "Clear, productised B2B service with transparent pricing.",
      "Likely too small to have a dedicated sales team.",
      "Founder-led sales limits who an outreach message can reach.",
    ],
    message:
      "Your flat monthly design subscription is one of the clearest offers I've seen. Curious how you keep the request queue moving as more clients join.",
  },
  "thoughtbot.com": {
    summary:
      "A product design and development consultancy that builds web and mobile apps and helps teams improve existing products.",
    industry: "Software consultancy",
    sizeSignal: "Mid-sized agency with distinct service lines and case studies.",
    score: 86,
    reasons: [
      "B2B service company with a clear consulting offer.",
      "Case studies and service pages suggest an active sales process.",
      "Size appears to sit inside the 10–200 employee range.",
    ],
    message:
      "Loved the way your case studies walk through the product decisions, not just the build. Would it be useful to see how teams like yours qualify inbound before discovery calls?",
  },
  "dockyard.com": {
    summary:
      "A digital product consultancy known for Elixir and web engineering, offering strategy, design and development for client products.",
    industry: "Software consultancy",
    sizeSignal: "Agency-sized team; multiple practice areas described.",
    score: 82,
    reasons: [
      "Sells engineering and design services to businesses.",
      "Clear specialism gives outreach a concrete angle.",
      "Evidence of a structured engagement process.",
    ],
    message:
      "Your focus on Elixir for long-lived products stood out. Curious whether that niche makes outbound easier or harder to target for you.",
  },
  "metalab.com": {
    summary:
      "A product design agency that partners with startups and established companies to design and build digital products.",
    industry: "Product design agency",
    sizeSignal: "Established agency with a well-known client roster.",
    score: 80,
    reasons: [
      "B2B design and build service with a clear positioning.",
      "Client logos indicate an active new-business function.",
      "Likely mid-sized; possibly at the upper end of the profile.",
    ],
    message:
      "The product work on your homepage speaks for itself. I'd love to hear how you decide which inbound projects are worth a first call.",
  },
  "work.co": {
    summary:
      "A digital product agency that designs and builds products for large brands, now part of a larger consultancy group.",
    industry: "Digital agency",
    sizeSignal: "Part of a larger group; likely above the ideal size range.",
    score: 61,
    reasons: [
      "Strong B2B service offer with clear outcomes.",
      "Parent-company ownership points to enterprise scale.",
      "Decision makers may sit outside the agency itself.",
    ],
    message:
      "The way you frame products as the brand itself is a sharp idea. Curious how that pitch lands with new clients.",
  },
  "ustwo.com": {
    summary:
      "A digital product studio that designs services and products for clients, alongside its own studio games.",
    industry: "Digital product studio",
    sizeSignal: "Multi-office studio; mid-sized with an international presence.",
    score: 72,
    reasons: [
      "Clear B2B product and service design offer.",
      "Multiple offices suggest a business development team.",
      "Split focus with its own games makes positioning less specific.",
    ],
    message:
      "Interesting to see a client services studio that also ships its own games. Does that work show up in how you win new client projects?",
  },
  "instrument.com": {
    summary:
      "A digital agency offering brand, product and marketing work for technology and consumer brands.",
    industry: "Digital agency",
    sizeSignal: "Mid-sized independent agency with a broad client list.",
    score: 76,
    reasons: [
      "B2B creative services with clear capabilities.",
      "Independent and likely within the target size.",
      "Broad offer is slightly less specific than ideal.",
    ],
    message:
      "Your homepage mixes brand and product work in a way that feels unusually cohesive. How do you introduce both sides to a new prospect?",
  },
  "clay.global": {
    summary:
      "A UI/UX design and branding agency that designs websites, apps and brands for technology companies.",
    industry: "Design agency",
    sizeSignal: "Agency-sized team with a clear tech-company focus.",
    score: 84,
    reasons: [
      "Specific B2B design offer aimed at tech companies.",
      "Clear calls to action point to an active sales process.",
      "Size appears to fit the profile well.",
    ],
    message:
      "Your focus on design for tech companies makes the offer very clear. Curious how you prioritise inbound when several fit at once.",
  },
  "huemor.rocks": {
    summary:
      "A web design agency that builds custom, conversion-focused websites for businesses, with a strong personality-led brand.",
    industry: "Web design agency",
    sizeSignal: "Small-to-mid team; site lists services and a sales contact path.",
    score: 79,
    reasons: [
      "Clear B2B website design and development offer.",
      "Prominent consultation calls to action suggest a sales team.",
      "Likely within the 10–200 employee range.",
    ],
    message:
      "The personality in your site is refreshing for a web agency. Do prospects usually find you because of it, or in spite of it?",
  },
  "animalz.co": {
    summary:
      "A content marketing agency that writes strategy-led content for SaaS and technology companies.",
    industry: "Content marketing",
    sizeSignal: "Mid-sized agency with a clear B2B SaaS niche.",
    score: 88,
    reasons: [
      "Specialised B2B service with a precise audience.",
      "Strong thought-leadership signals an active growth team.",
      "Size sits comfortably in the target range.",
    ],
    message:
      "Your take on content as a long-term asset for SaaS is a strong angle. How do you identify which companies are ready for that kind of programme?",
  },
  "siegemedia.com": {
    summary:
      "A content marketing and SEO agency that creates content and digital PR campaigns for brands.",
    industry: "SEO and content",
    sizeSignal: "Established agency; mid-sized with defined services.",
    score: 83,
    reasons: [
      "Clear B2B SEO and content offer.",
      "Published results and case studies point to a sales motion.",
      "Likely within the ideal size range.",
    ],
    message:
      "The campaign results on your site are specific in a way most agencies avoid. Curious which of those stories closes deals most often.",
  },
  "klientboost.com": {
    summary:
      "A performance marketing agency focused on paid advertising and conversion rate optimisation for businesses.",
    industry: "Performance marketing",
    sizeSignal: "Mid-sized agency with sales-led consultation offers.",
    score: 90,
    reasons: [
      "B2B service with a clear, measurable offer.",
      "Free marketing plan offer indicates a dedicated sales team.",
      "Size fits the profile well.",
    ],
    message:
      "Offering a custom marketing plan up front is a confident move. How many of those turn into first calls for your team?",
  },
  "belkins.io": {
    summary:
      "A B2B lead generation agency providing appointment setting, cold email and sales development services.",
    industry: "B2B lead generation",
    sizeSignal: "Mid-sized team with a structured sales development offer.",
    score: 92,
    reasons: [
      "Sells a B2B service directly tied to sales outcomes.",
      "Sales team is the core of the business.",
      "Clear offer and size within the profile.",
    ],
    message:
      "Your focus on booked appointments rather than raw lead lists is a strong promise. Curious how you research accounts before the first touch.",
  },
  "salesroads.com": {
    summary:
      "An outsourced B2B sales development firm offering appointment setting and cold calling for business clients.",
    industry: "Outsourced sales",
    sizeSignal: "Agency-sized team; services described in detail.",
    score: 85,
    reasons: [
      "B2B sales service with a clear offer.",
      "Evidence of an in-house sales and SDR team.",
      "Size appears to fit the target profile.",
    ],
    message:
      "Interesting that you lead with US-based callers. Is that what most clients ask about first?",
  },
  "martal.ca": {
    summary:
      "A B2B sales outsourcing and lead generation company offering outbound campaigns and sales development.",
    industry: "Sales outsourcing",
    sizeSignal: "Mid-sized firm with multiple service tiers.",
    score: 87,
    reasons: [
      "Clear B2B outbound service.",
      "Sales development is central to the offer.",
      "Within the target employee range.",
    ],
    message:
      "Your mix of outbound campaigns and fractional sales reps is a smart package. Which one do clients usually start with?",
  },
  "webprofits.com.au": {
    summary:
      "A growth marketing agency offering paid media, SEO and conversion optimisation for businesses.",
    industry: "Growth marketing",
    sizeSignal: "Mid-sized agency with offices in more than one country.",
    score: 77,
    reasons: [
      "B2B marketing service with a clear growth focus.",
      "Multi-market presence suggests a business development team.",
      "Offer is broad, which slightly weakens fit.",
    ],
    message:
      "Your growth framing goes beyond the usual channel list. Curious how you scope that with a new client in the first call.",
  },
  "nike.com": {
    summary:
      "A global sportswear brand selling footwear, apparel and equipment directly to consumers.",
    industry: "Consumer retail",
    sizeSignal: "Very large global enterprise.",
    score: 8,
    reasons: [
      "B2C retail business, outside the profile.",
      "Very large enterprise.",
      "No B2B service offer on the homepage.",
    ],
    message:
      "Your latest product launches look great. Not a fit for this outreach list.",
  },
  "netflix.com": {
    summary:
      "A subscription streaming service offering films and series to consumers.",
    industry: "Media and entertainment",
    sizeSignal: "Very large global enterprise.",
    score: 6,
    reasons: [
      "Consumer subscription product, not a B2B service.",
      "Very large enterprise.",
      "Homepage is a sign-up page with no business offer.",
    ],
    message: "Consumer streaming service. Not a fit for this outreach list.",
  },
  "coca-cola.com": {
    summary:
      "A global beverage company marketing soft drinks and other beverages to consumers.",
    industry: "Consumer goods",
    sizeSignal: "Very large global enterprise.",
    score: 5,
    reasons: [
      "Consumer goods brand, outside the profile.",
      "Very large enterprise.",
      "No service offer to sell into.",
    ],
    message: "Global consumer brand. Not a fit for this outreach list.",
  },
  "spotify.com": {
    summary:
      "A music and podcast streaming platform with free and premium plans for consumers.",
    industry: "Consumer software",
    sizeSignal: "Very large global enterprise.",
    score: 12,
    reasons: [
      "Primarily a consumer subscription product.",
      "Very large enterprise.",
      "Advertising offer exists but is not a service business.",
    ],
    message: "Consumer streaming platform. Not a fit for this outreach list.",
  },
};

function bareDomain(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return website.toLowerCase();
  }
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function fallbackResult(lead: PipelineLead): DemoResult {
  const score = 35 + (hash(lead.website) % 50);
  return {
    summary: `Demo result for ${lead.company}. In real mode Scout reads the homepage and summarises what the company sells.`,
    industry: "Unknown (demo)",
    sizeSignal: "Not assessed in demo mode.",
    score,
    reasons: [
      "Demo mode: no website was fetched.",
      "Score is a deterministic placeholder for this row.",
      "Add an OpenAI key to research this company for real.",
    ],
    message: `Hi ${lead.contactName?.split(" ")[0] ?? "there"}, I came across ${lead.company} and had a quick question about how you find new clients.`,
  };
}

function tierForScore(score: number): LeadInsight["tier"] {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function stepDuration(seed: number, stage: number) {
  const base = Number(process.env.DEMO_STEP_MS) || 650;
  const jitter = ((seed >> (stage * 4)) % 9) / 20; // 0 – 0.4
  return Math.round(base * (0.8 + jitter));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processDemoLead(
  lead: PipelineLead,
  onStatus?: (status: DemoStage) => void,
): Promise<LeadInsight> {
  const seed = hash(lead.company + lead.website);
  const stages: DemoStage[] = ["researching", "enriching", "scoring", "drafting"];

  for (const [index, stage] of stages.entries()) {
    onStatus?.(stage);
    await wait(stepDuration(seed, index));
  }

  const result = SAMPLE_RESULTS[bareDomain(lead.website)] ?? fallbackResult(lead);

  return { ...result, tier: tierForScore(result.score) };
}
