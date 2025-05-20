import { MockMCPServer } from "./mcp-server-mock";

// Create a singleton instance of the mock server
const mockServer = new MockMCPServer();

// Override the global fetch function when in development mode
// This will intercept calls to mock URLs and redirect them to our mock server
export function setupMockServerAdapter() {
  // Store the original fetch
  const originalFetch = window.fetch;

  // Only intercept in development
  if (import.meta.env.DEV) {
    // Override fetch
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const url = input.toString();
      
      // Check if the URL contains a special flag for using the mock server
      if (url.includes('mock-mcp-server.local')) {
        console.log('[Mock] Intercepting request to:', url);
        
        // Extract the endpoint from the URL
        const endpoint = url.split('/').pop();
        
        // Handle the different endpoints
        if (endpoint === 'manifest') {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get token from headers if present
          const authHeader = init?.headers && typeof init.headers === 'object' 
            ? (init.headers as Record<string, string>)['Authorization'] 
            : '';
          const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
          
          try {
            const manifest = await mockServer.getManifest(token);
            return new Response(JSON.stringify(manifest), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({ error: (error as Error).message }), {
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Handle tool execution
        if (url.includes('/tools/')) {
          // Extract tool slug from URL
          const toolSlug = url.split('/tools/')[1];
          
          // Get token from headers if present
          const authHeader = init?.headers && typeof init.headers === 'object' 
            ? (init.headers as Record<string, string>)['Authorization'] 
            : '';
          const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
          
          // Get request body
          const body = init?.body ? JSON.parse(init.body as string) : {};
          
          try {
            // Simulate longer processing time
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const result = await mockServer.executeTool(toolSlug, body, token);
            return new Response(JSON.stringify(result), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            return new Response(JSON.stringify({ error: (error as Error).message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Fallback for unhandled mock endpoints
        return new Response(JSON.stringify({ error: 'Not implemented' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Pass through to the original fetch for all other URLs
      return originalFetch(input, init);
    };
    
    console.log('[Mock] Mock server adapter initialized');
    console.log('[Mock] Use https://mock-mcp-server.local to connect to the mock server');
  }
}