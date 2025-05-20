// MCP Server types
export interface MCPServer {
  url: string;
  name?: string;
  authType?: "none" | "bearer" | "apiKey" | "oauth_pkce" | "api_key";
  lastConnected?: string;
  authToken?: string;
}

export interface MCPServerWithAuth extends MCPServer {
  authToken: string;
}

// MCP Manifest types
export interface MCPManifest {
  name: string;
  description?: string;
  version?: string;
  auth?: {
    type: "none" | "bearer" | "apiKey" | "oauth_pkce" | "api_key";
    required: boolean;
    name?: string;
    header?: string;
    authorizationUrl?: string;
    tokenUrl?: string;
    scopes?: string[];
  };
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  inputs: JSONSchema;
  outputs?: JSONSchema;
}

// Basic JSON Schema types (simplified for this application)
export interface JSONSchema {
  type: string;
  title?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, JSONSchemaProperty>;
  items?: JSONSchemaProperty;
  enum?: (string | number | boolean)[];
  default?: any;
  const?: any;
  examples?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  format?: string;
  pattern?: string;
  oneOf?: JSONSchemaProperty[];
  anyOf?: JSONSchemaProperty[];
}

export interface JSONSchemaProperty {
  type: string;
  title?: string;
  description?: string;
  default?: any;
  const?: any;
  examples?: any[];
  enum?: (string | number | boolean)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  format?: string;
  pattern?: string;
  properties?: Record<string, JSONSchemaProperty>;
  items?: JSONSchemaProperty;
  oneOf?: JSONSchemaProperty[];
  anyOf?: JSONSchemaProperty[];
  required?: string[];
}

// Tool execution types
export interface ToolRequest {
  toolSlug: string;
  inputs: Record<string, any>;
  serverUrl: string;
  authToken?: string;
}

export interface ToolResponse {
  success: boolean;
  result?: any;
  error?: string;
  logs?: string[];
}

export interface ToolExecution {
  id: string;
  toolSlug: string;
  toolName: string;
  serverUrl: string;
  inputs: Record<string, any>;
  outputs?: any;
  status: "running" | "completed" | "error";
  startTime: string;
  endTime?: string;
  duration?: number;
  logs: string[];
}

// History storage
export interface AppHistory {
  recentServers: MCPServer[];
  executions: ToolExecution[];
}

// Application state
export interface AppState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  serverUrl: string;
  serverManifest?: MCPManifest;
  connectionError?: string;
  
  // Auth state
  requiresAuth: boolean;
  isAuthenticating: boolean;
  authToken?: string;
  authError?: string;
  
  // Tool state
  tools: MCPTool[];
  selectedTool?: MCPTool;
  filteredTools: MCPTool[];
  searchQuery: string;
  activeTags: string[];
  
  // Execution state
  currentExecution?: ToolExecution;
  isExecuting: boolean;
  executionError?: string;
  
  // UI state
  activeView: "url" | "auth" | "main";
  activeTab: "catalog" | "detail" | "output";
  activeOutputTab: "result" | "console" | "raw";
}
