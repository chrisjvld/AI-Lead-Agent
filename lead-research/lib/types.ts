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

export type LeadAnalysis = z.infer<typeof LeadAnalysisSchema>;
export type LeadInsight = z.infer<typeof LeadInsightSchema>;
export type PipelineLead = z.infer<typeof PipelineLeadSchema>;
