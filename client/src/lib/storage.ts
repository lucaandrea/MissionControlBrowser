import { AppHistory, MCPServer, ToolExecution } from "@/shared/types";

const STORAGE_KEYS = {
  RECENT_SERVERS: "mcp-browser:recent-servers",
  EXECUTIONS: "mcp-browser:executions",
  AUTH_TOKENS: "mcp-browser:auth-tokens",
};

const MAX_RECENT_SERVERS = 10;
const MAX_EXECUTIONS = 50;

/**
 * Loads the application history from localStorage
 */
export function loadHistory(): AppHistory {
  try {
    const recentServersJson = localStorage.getItem(STORAGE_KEYS.RECENT_SERVERS);
    const executionsJson = localStorage.getItem(STORAGE_KEYS.EXECUTIONS);

    return {
      recentServers: recentServersJson ? JSON.parse(recentServersJson) : [],
      executions: executionsJson ? JSON.parse(executionsJson) : [],
    };
  } catch (error) {
    console.error("Failed to load history from localStorage:", error);
    return { recentServers: [], executions: [] };
  }
}

/**
 * Saves an MCP server to the recent servers list
 */
export function saveServer(server: MCPServer): void {
  try {
    const recentServersJson = localStorage.getItem(STORAGE_KEYS.RECENT_SERVERS);
    const recentServers: MCPServer[] = recentServersJson
      ? JSON.parse(recentServersJson)
      : [];

    // Remove any existing entries with the same URL
    const filteredServers = recentServers.filter((s) => s.url !== server.url);

    // Add the server to the beginning of the list
    const updatedServers = [
      { ...server, lastConnected: new Date().toISOString() },
      ...filteredServers,
    ].slice(0, MAX_RECENT_SERVERS);

    localStorage.setItem(STORAGE_KEYS.RECENT_SERVERS, JSON.stringify(updatedServers));
  } catch (error) {
    console.error("Failed to save server to localStorage:", error);
  }
}

/**
 * Saves an auth token for a server
 */
export function saveAuthToken(serverUrl: string, token: string): void {
  try {
    const authTokensJson = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    const authTokens: Record<string, string> = authTokensJson
      ? JSON.parse(authTokensJson)
      : {};

    authTokens[serverUrl] = token;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(authTokens));
  } catch (error) {
    console.error("Failed to save auth token to localStorage:", error);
  }
}

/**
 * Gets an auth token for a server
 */
export function getAuthToken(serverUrl: string): string | undefined {
  try {
    const authTokensJson = localStorage.getItem(STORAGE_KEYS.AUTH_TOKENS);
    if (!authTokensJson) return undefined;
    
    const authTokens: Record<string, string> = JSON.parse(authTokensJson);
    return authTokens[serverUrl];
  } catch (error) {
    console.error("Failed to get auth token from localStorage:", error);
    return undefined;
  }
}

/**
 * Saves a tool execution to history
 */
export function saveExecution(execution: ToolExecution): void {
  try {
    const executionsJson = localStorage.getItem(STORAGE_KEYS.EXECUTIONS);
    const executions: ToolExecution[] = executionsJson
      ? JSON.parse(executionsJson)
      : [];

    // Add the execution to the beginning of the list
    const updatedExecutions = [execution, ...executions].slice(0, MAX_EXECUTIONS);

    localStorage.setItem(STORAGE_KEYS.EXECUTIONS, JSON.stringify(updatedExecutions));
  } catch (error) {
    console.error("Failed to save execution to localStorage:", error);
  }
}

/**
 * Clears all history
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.RECENT_SERVERS);
  localStorage.removeItem(STORAGE_KEYS.EXECUTIONS);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
}
