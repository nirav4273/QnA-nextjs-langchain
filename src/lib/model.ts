import { getGroqModel } from "@/lib/groq";
import { getNvidiaModel } from "@/lib/nvidia";

export function getChatModel() {
  const provider = process.env.MODEL_PROVIDER ?? "groq";
  console.log({provider})
  switch (provider) {
    case "nvidia":
      return getNvidiaModel();
    case "groq":
      return getGroqModel();
    default:
      throw new Error(`Unknown MODEL_PROVIDER: ${provider}`);
  }
}
