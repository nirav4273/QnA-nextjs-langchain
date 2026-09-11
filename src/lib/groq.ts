import { ChatGroq } from "@langchain/groq";

let client: ChatGroq | null = null;

export function getGroqModel() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }

    client = new ChatGroq({
      apiKey,
      model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
      temperature: 0.7,
      // streaming: true
    });
  }

  return client;
}
