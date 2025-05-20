import { create } from "zustand";
import { MCPClient, createToolExecution, completeToolExecution } from "@/lib/mcp-client";
import { AppState, MCPServer, MCPTool, ToolExecution } from "@/shared/types";
import { saveServer, saveAuthToken, getAuthToken, saveExecution, loadHistory } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

// Initial application state
const initialState: AppState = {
  // Connection state
  isConnected: false,
  isConnecting: false,
  serverUrl: "",
  
  // Auth state
  requiresAuth: false,
  isAuthenticating: false,
  
  // Tool state
  tools: [],
  filteredTools: [],
  searchQuery: "",
  activeTags: [],
  
  // Execution state
  isExecuting: false,
  
  // UI state
  activeView: "url",
  activeTab: "catalog",
  activeOutputTab: "result",
};

// Load history from localStorage
const history = loadHistory();

export const useAppStore = create<
  AppState & {
    recentServers: MCPServer[];
    
    // Actions
    connect: (url: string) => Promise<void>;
    disconnect: () => void;
    authenticate: (token: string, remember: boolean) => Promise<void>;
    cancelAuth: () => void;
    selectTool: (tool: MCPTool) => void;
    executeTool: (tool: MCPTool, inputs: Record<string, any>) => Promise<void>;
    clearExecution: () => void;
  }
>((set, get) => ({
  ...initialState,
  recentServers: history.recentServers,
  
  // Connect to a server
  connect: async (url: string) => {
    try {
      set({ isConnecting: true, serverUrl: url, connectionError: undefined });
      
      // Check if we have an auth token for this server
      const savedToken = getAuthToken(url);
      
      // Create a client instance
      const client = new MCPClient(url, savedToken);
      
      // Fetch the manifest
      const manifest = await client.getManifest();
      
      // Save the server to recent servers
      const server: MCPServer = {
        url,
        name: manifest.name,
        authType: manifest.auth?.type,
        lastConnected: new Date().toISOString(),
      };
      saveServer(server);
      
      // If the server requires auth and we don't have a token, show auth screen
      if (manifest.auth?.required && !savedToken) {
        set({
          isConnecting: false,
          activeView: "auth",
          requiresAuth: true,
          serverManifest: manifest,
          recentServers: [server, ...history.recentServers.filter(s => s.url !== url)].slice(0, 10),
        });
        return;
      }
      
      // Connect was successful
      set({
        isConnecting: false,
        isConnected: true,
        activeView: "main",
        tools: manifest.tools,
        filteredTools: manifest.tools,
        serverManifest: manifest,
        authToken: savedToken,
        requiresAuth: false,
        recentServers: [server, ...history.recentServers.filter(s => s.url !== url)].slice(0, 10),
      });
    } catch (error) {
      set({
        isConnecting: false,
        connectionError: error instanceof Error ? error.message : String(error),
      });
      
      // We'll handle error toasts in the component instead
      console.error("Connection failed:", error instanceof Error ? error.message : String(error));
    }
  },
  
  // Disconnect from the server
  disconnect: () => {
    set({
      ...initialState,
      recentServers: get().recentServers,
    });
  },
  
  // Authenticate with a server
  authenticate: async (token: string, remember: boolean) => {
    const { serverUrl, serverManifest } = get();
    
    try {
      set({ isAuthenticating: true, authError: undefined });
      
      // Create a client instance with the token
      const client = new MCPClient(serverUrl, token);
      
      // Verify the token by re-fetching the manifest
      await client.getManifest();
      
      // Save the token if requested
      if (remember) {
        saveAuthToken(serverUrl, token);
      }
      
      // Authentication was successful
      set({
        isAuthenticating: false,
        isConnected: true,
        activeView: "main",
        tools: serverManifest?.tools || [],
        filteredTools: serverManifest?.tools || [],
        authToken: token,
        requiresAuth: false,
      });
    } catch (error) {
      set({
        isAuthenticating: false,
        authError: error instanceof Error ? error.message : String(error),
      });
      
      // We'll handle error messages in the component instead
      console.error("Authentication failed:", error instanceof Error ? error.message : String(error));
    }
  },
  
  // Cancel authentication
  cancelAuth: () => {
    set({
      activeView: "url",
      requiresAuth: false,
    });
  },
  
  // Select a tool
  selectTool: (tool: MCPTool) => {
    set({
      selectedTool: tool,
      activeTab: "detail",
    });
  },
  
  // Execute a tool
  executeTool: async (tool: MCPTool, inputs: Record<string, any>) => {
    const { serverUrl, authToken } = get();
    
    try {
      set({ isExecuting: true, executionError: undefined });
      
      // Create a client instance
      const client = new MCPClient(serverUrl, authToken);
      
      // Create a new execution record
      const execution = createToolExecution(tool.slug, tool.name, serverUrl, inputs);
      set({ currentExecution: execution, activeTab: "output" });
      
      // Execute the tool
      const generator = client.executeTool(tool.slug, inputs);
      
      let finalResponse: any = null;
      
      // Process streaming updates
      for await (const response of generator) {
        if (response.success) {
          finalResponse = response.result;
        }
        
        // Update the execution with the latest logs
        set((state) => ({
          currentExecution: state.currentExecution
            ? { ...state.currentExecution, logs: response.logs || [] }
            : undefined,
        }));
      }
      
      // Update the execution with the final result
      const updatedExecution = completeToolExecution(
        execution,
        finalResponse !== null,
        finalResponse,
        finalResponse === null ? "Execution failed" : undefined
      );
      
      set({
        isExecuting: false,
        currentExecution: updatedExecution,
      });
      
      // Save the execution to history
      saveExecution(updatedExecution);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Update the execution with the error
      if (get().currentExecution) {
        const failedExecution = completeToolExecution(
          get().currentExecution!,
          false,
          undefined,
          errorMessage
        );
        
        set({
          isExecuting: false,
          currentExecution: failedExecution,
          executionError: errorMessage,
        });
        
        // Save the execution to history
        saveExecution(failedExecution);
      } else {
        set({
          isExecuting: false,
          executionError: errorMessage,
        });
      }
      
      // We'll handle error messages in the component
      console.error("Execution failed:", errorMessage);
    }
  },
  
  // Clear the current execution
  clearExecution: () => {
    set({
      currentExecution: undefined,
    });
  },
}));
