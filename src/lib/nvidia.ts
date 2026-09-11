import { ChatOpenAI } from "@langchain/openai";

let client: ChatOpenAI | null = null;

export function getNvidiaModel() {
  if (!client) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA_API_KEY environment variable is not set");
    }

    client = new ChatOpenAI({
      apiKey,
      model: "nvidia/nemotron-3.5-lightning-30b-a3b",
      temperature: 0.7,
      configuration: {
        baseURL: "https://integrate.api.nvidia.com/v1",
      },
    });
  }

  return client;
}
