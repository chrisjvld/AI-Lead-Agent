import { z } from "zod";

export const LeadAnalysisSchema = z
  .object({
    summary: z
      .string()
      .describe("A concise, factual summary of what the company offers."),
    industry: z.string().describe("The company's primary industry."),
    sizeSignal: z
      .string()
      .describe(
        "A short description of website evidence about company size. State when evidence is limited.",
      ),
    score: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe("Qualification score from 0 to 100."),
    reasons: z
      .array(z.string())
      .describe("Brief reasons supporting the qualification score."),
    message: z
      .string()
      .describe(
        "A short personalised outreach opener referencing a specific website detail.",
      ),
  })
  .strict();

export const LeadInsightSchema = LeadAnalysisSchema.extend({
  tier: z.enum(["Hot", "Warm", "Cold"]),
});

export const PipelineLeadSchema = z
  .object({
    company: z.string().trim().min(1),
    website: z.url(),
    contactName: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();

export const LeadRecordSchema = z
  .object({
    id: z.number().int().positive(),
    company: z.string(),
    website: z.string(),
    contactName: z.string(),
    title: z.string(),
    email: z.string(),
    status: z.enum(["queued", "researching", "scoring", "done", "failed"]),
    summary: z.string().nullable(),
    industry: z.string().nullable(),
    sizeSignal: z.string().nullable(),
    score: z.number().int().min(0).max(100).nullable(),
    tier: z.enum(["Hot", "Warm", "Cold"]).nullable(),
    reasons: z.array(z.string()).nullable(),
    message: z.string().nullable(),
    approved: z.boolean(),
    error: z.string().nullable(),
    createdAt: z.string(),
  })
  .strict();

export const LeadsResponseSchema = z
  .object({
    leads: z.array(LeadRecordSchema),
  })
  .strict();

export type LeadAnalysis = z.infer<typeof LeadAnalysisSchema>;
export type LeadInsight = z.infer<typeof LeadInsightSchema>;
export type PipelineLead = z.infer<typeof PipelineLeadSchema>;
export type LeadRecord = z.infer<typeof LeadRecordSchema>;
