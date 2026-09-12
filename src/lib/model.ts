import { getGroqModel } from "@/lib/groq";
import { getOpenAIModel } from "@/lib/openai";

export function getChatModel() {
  const provider = process.env.MODEL_PROVIDER ?? "groq";
  console.log({provider})
  switch (provider) {
    case "groq":
      return getGroqModel();
    case "openai":
      return getOpenAIModel();
    default:
      throw new Error(`Unknown MODEL_PROVIDER: ${provider}`);
  }
}
