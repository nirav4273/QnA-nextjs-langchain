import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { getChatModel } from "@/lib/model";
import { createAgent, tool, summarizationMiddleware, countTokensApproximately } from "langchain";
import type { BaseMessage } from "@langchain/core/messages";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { SEARCH_TOOL_DESCRIPTION, SYSTEM_PROMPT } from "@/lib/constant";
import { mathTool } from "@/app/tools/math";
// lib/globalLogger.ts
// import { CallbackManager } from "@langchain/core/callbacks/manager";
import {toolLogger } from "@/lib/toolLogger";

// Register once, at app startup — applies to ALL chains/agents/tools afterward
// CallbackManager.configure([new ToolLoggerCallback()]);

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
})

const tavilySearch = tool(
  async ({ query }) => {
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

const baseAgent = createAgent({
  systemPrompt: SYSTEM_PROMPT,
  model: getChatModel(),
  tools: [mathTool, tavilySearch],
  checkpointer: new MemorySaver(),
  middleware: [
    summarizationMiddleware({
      model: getChatModel(),
      trigger: { tokens: 4000, messages: 10 },
      keep: { messages: 20 },
      tokenCounter: (messages: BaseMessage[]) => {
        const tokens = countTokensApproximately(messages);
        const triggered = tokens >= 4000 && messages.length >= 10;
        console.log(
          `[summarizationMiddleware] tokens=${tokens} messages=${messages.length} triggered=${triggered}`
        );
        return tokens;
      },
    }),
  ],
})

const agents = baseAgent.withConfig({
  callbacks: [toolLogger],
});

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
    const lastMessage = response.messages[response.messages.length - 1];

    return NextResponse.json({ data: lastMessage, answer: lastMessage.content, sessionId });
  } catch (error) {
    console.error("Groq chat error:", error);
    return NextResponse.json(
      { error: "Failed to get a response from the model" },
      { status: 500 }
    );
  }
}
