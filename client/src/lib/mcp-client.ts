import { MCPManifest, ToolRequest, ToolResponse, ToolExecution } from "@/shared/types";

export class MCPClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.authToken = authToken;
  }

  /**
   * Fetches the manifest from an MCP server
   */
  async getManifest(): Promise<MCPManifest> {
    const response = await fetch(`${this.baseUrl}/manifest`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch manifest: ${response.status} ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Executes a tool with the provided inputs
   * Returns an async generator that yields streaming updates
   */
  async *executeTool(
    toolSlug: string,
    inputs: Record<string, any>
  ): AsyncGenerator<ToolResponse> {
    const executionId = crypto.randomUUID();
    const startTime = new Date().toISOString();
    const logs: string[] = [];

    try {
      const response = await fetch(`${this.baseUrl}/tools/${toolSlug}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tool execution failed: ${response.status} ${errorText}`);
      }

      // Handle streaming response
      if (response.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data === "[DONE]") {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.log) {
                  logs.push(parsed.log);
                }
                yield { success: true, result: parsed, logs: [...logs] };
              } catch (e) {
                console.error("Failed to parse SSE data:", e);
              }
            }
          }
        }
      } else {
        // Handle regular JSON response
        const result = await response.json();
        yield { success: true, result, logs };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logs.push(`Error: ${errorMessage}`);
      yield { success: false, error: errorMessage, logs };
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }
}

/**
 * Creates a tool execution object with initial values
 */
export function createToolExecution(
  toolSlug: string,
  toolName: string,
  serverUrl: string,
  inputs: Record<string, any>
): ToolExecution {
  return {
    id: crypto.randomUUID(),
    toolSlug,
    toolName,
    serverUrl,
    inputs,
    status: "running",
    startTime: new Date().toISOString(),
    logs: [],
  };
}

/**
 * Updates a tool execution with the final result
 */
export function completeToolExecution(
  execution: ToolExecution,
  success: boolean,
  result?: any,
  error?: string
): ToolExecution {
  const endTime = new Date().toISOString();
  const startTimeMs = new Date(execution.startTime).getTime();
  const endTimeMs = new Date(endTime).getTime();
  const duration = (endTimeMs - startTimeMs) / 1000;

  return {
    ...execution,
    status: success ? "completed" : "error",
    outputs: result,
    endTime,
    duration,
    logs: error ? [...execution.logs, `Error: ${error}`] : execution.logs,
  };
}
