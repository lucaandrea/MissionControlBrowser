import {
  MCPManifest,
  ToolRequest,
  ToolResponse,
  ToolExecution,
} from "@/shared/types";

export interface ParsedSSE {
  type: "log" | "partial" | "final" | string;
  data: any;
}

export class MCPClient {
  private baseUrl: string;
  private authToken?: string;
  private manifest?: MCPManifest;
  private manifestPath = "/.well-known/mcp.json";
  private toolsPath = "/v1/tools";

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.authToken = authToken;
  }

  /**
   * Detects endpoint paths using well known discovery
   */
  private async detectEndpoints(): Promise<void> {
    try {
      const head = await fetch(`${this.baseUrl}/.well-known/mcp.json`, {
        method: "HEAD",
      });
      if (head.ok) {
        this.manifestPath = "/.well-known/mcp.json";
      } else {
        this.manifestPath = "/manifest";
      }
    } catch {
      this.manifestPath = "/manifest";
    }

    try {
      const test = await fetch(`${this.baseUrl}/v1/tools`, { method: "HEAD" });
      if (test.ok) {
        this.toolsPath = "/v1/tools";
      } else {
        this.toolsPath = "/tools";
      }
    } catch {
      this.toolsPath = "/tools";
    }
  }

  /**
   * Fetches the manifest from an MCP server
   */
  async getManifest(): Promise<MCPManifest> {
    await this.detectEndpoints();
    const response = await fetch(`${this.baseUrl}${this.manifestPath}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch manifest: ${response.status} ${errorText}`);
    }

    this.manifest = await response.json();
    return this.manifest;
  }

  /**
   * Executes a tool with the provided inputs
   * Returns an async generator that yields streaming updates
   */
  async *executeTool(
    toolSlug: string,
    inputs: Record<string, any>
  ): AsyncGenerator<ToolResponse> {
    await this.detectEndpoints();
    const logs: string[] = [];

    try {
      for await (const evt of this.fetchSSE(`${this.baseUrl}${this.toolsPath}/${toolSlug}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(inputs),
      })) {
        if (evt.type === "log" && typeof evt.data === "string") {
          logs.push(evt.data);
          yield { success: true, result: { log: evt.data }, logs: [...logs] };
        } else if (evt.type === "partial") {
          yield { success: true, result: evt.data, logs: [...logs] };
        } else if (evt.type === "final") {
          yield { success: true, result: evt.data, logs: [...logs] };
          return;
        }
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
    if (this.manifest?.auth) {
      const type = this.manifest.auth.type;
      if ((type === "bearer" || type === "oauth_pkce") && this.authToken) {
        headers["Authorization"] = `Bearer ${this.authToken}`;
      } else if (type === "api_key" && this.authToken) {
        const name =
          (this.manifest.auth as any).name || (this.manifest.auth as any).header || "X-API-Key";
        headers[name] = this.authToken;
      }
    } else if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  /**
   * Connects to an SSE endpoint with reconnection support
   */
  private async *fetchSSE(
    url: string,
    init: RequestInit
  ): AsyncGenerator<ParsedSSE> {
    let attempt = 0;
    const maxDelay = 30000;
    const controller = new AbortController();
    const signal = init.signal ?? controller.signal;

    while (!signal.aborted) {
      try {
        const resp = await fetch(url, { ...init, signal });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        if (!resp.headers.get("content-type")?.includes("text/event-stream")) {
          const data = await resp.json();
          yield { type: "final", data };
          return;
        }
        for await (const evt of this.parseSSE(resp)) {
          yield evt;
        }
        return;
      } catch (err) {
        if (signal.aborted) {
          return;
        }
        const delay = Math.min(1000 * 2 ** attempt++, maxDelay);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  /**
   * Parses an SSE response and yields events
   */
  private async *parseSSE(response: Response): AsyncGenerator<ParsedSSE> {
    const reader = response.body?.getReader();
    if (!reader) {
      return;
    }
    const decoder = new TextDecoder();
    let buffer = "";
    let eventType: string | undefined;
    let dataBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line === "") {
          if (dataBuffer) {
            let parsed: any = dataBuffer;
            try {
              parsed = JSON.parse(dataBuffer);
            } catch {}
            yield { type: eventType || "message", data: parsed };
          }
          dataBuffer = "";
          eventType = undefined;
          continue;
        }
        if (line.startsWith(":")) {
          continue; // keep-alive comment
        }
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          dataBuffer += line.slice(5).trim();
        }
      }
    }
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
