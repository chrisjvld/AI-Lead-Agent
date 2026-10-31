import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

let client: OpenAI | undefined;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  client ??= new OpenAI({ apiKey });
  return client;
}

export async function structured<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  name: string,
): Promise<T> {
  const model = process.env.OPENAI_MODEL;

  if (!model) {
    throw new Error("OPENAI_MODEL is not set.");
  }

  const response = await getClient().responses.parse({
    model,
    input: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    text: {
      format: zodTextFormat(schema, name),
    },
  });

  if (!response.output_parsed) {
    throw new Error("The model returned no structured output.");
  }

  return schema.parse(response.output_parsed);
}
