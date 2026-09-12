import { ChatOpenAI } from "@langchain/openai";

let client: ChatOpenAI | null = null;

export function getOpenAIModel() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    client = new ChatOpenAI({
      apiKey,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.7,
    });
  }

  return client;
}
