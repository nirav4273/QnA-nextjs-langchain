import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { getChatModel } from "@/lib/model";
import { createAgent, tool } from "langchain";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { SEARCH_TOOL_DESCRIPTION, SYSTEM_PROMPT } from "@/lib/constant";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const tavilySearch = tool(
  async ({ query }) => {
    console.log({query}, "===")
    const results = await tvly.search(query);
    return JSON.stringify(results);
  },
  {
    name: "tavily_search",
    description: SEARCH_TOOL_DESCRIPTION,
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

const agents = createAgent({
  systemPrompt: SYSTEM_PROMPT,
  model: getChatModel(),
  tools: [tavilySearch],
  checkpointer: new MemorySaver(),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const question = body?.question;
  const sessionId =
    typeof body?.sessionId === "string" && body.sessionId.length > 0
      ? body.sessionId
      : crypto.randomUUID();

  if (typeof question !== "string" || question.trim().length === 0) {
    return NextResponse.json(
      { error: "Request body must include a non-empty 'question' string" },
      { status: 400 }
    );
  }

  try {
    const response = await agents.invoke(
      {
        messages: [
          new SystemMessage("You are a helpful assistant. Answer concisely."),
          new HumanMessage(question),
        ],
      },
      { configurable: { thread_id: sessionId } }
    );
    console.log({response})
    const lastMessage = response.messages[response.messages.length - 1];

    return NextResponse.json({ answer: lastMessage.content, sessionId });
  } catch (error) {
    console.error("Groq chat error:", error);
    return NextResponse.json(
      { error: "Failed to get a response from the model" },
      { status: 500 }
    );
  }
}
