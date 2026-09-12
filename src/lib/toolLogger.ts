import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import type { Serialized } from "@langchain/core/load/serializable";

export class ToolLoggerCallback extends BaseCallbackHandler {
  name = "ToolLoggerCallback";

  private startTimes = new Map<string, number>();

  async handleToolStart(
    tool: Serialized,
    input: string,
    runId: string,
    parentRunId?: string,
    tags?: string[],
    metadata?: Record<string, unknown>,
    name?: string
  ) {
    this.startTimes.set(runId, Date.now());
    console.log(`[TOOL START] ${name ?? tool.id?.at(-1)} runId=${runId}`, {
      input,
    });
  }

  async handleToolEnd(output: unknown, runId: string) {
    const start = this.startTimes.get(runId);
    const duration = start ? Date.now() - start : undefined;
    console.log(`[TOOL END] runId=${runId} (${duration}ms)`, { output });
    this.startTimes.delete(runId);
  }

  async handleToolError(err: Error, runId: string) {
    const start = this.startTimes.get(runId);
    const duration = start ? Date.now() - start : undefined;
    console.error(`[TOOL ERROR] runId=${runId} (${duration}ms)`, err);
    this.startTimes.delete(runId);
  }
}

export const toolLogger = new ToolLoggerCallback();