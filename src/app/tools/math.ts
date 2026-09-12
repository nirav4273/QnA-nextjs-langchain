import { tool } from "langchain";
import { z } from "zod";

export const mathTool = tool(
  async ({ a, b, operator }) => {
    let result: number;

    switch (operator) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) return "Error: division by zero";
        result = a / b;
        break;
      default:
        return `Error: unsupported operator '${operator}'`;
    }

    return `Result: ${result}`;
  },
  {
    name: "calculator",
    description:
      "Perform a basic arithmetic operation between two numbers. " +
      "Pass the two operands and the operator to use — do not pass a math expression string.",
    schema: z.object({
      a: z.number().describe("The first number"),
      b: z.number().describe("The second number"),
      operator: z
        .enum(["add", "subtract", "multiply", "divide"])
        .describe("The operation to perform on a and b"),
    }),
  }
);