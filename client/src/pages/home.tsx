import { useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ServerConnectForm } from "@/components/server-connect-form";
import { AuthForm } from "@/components/auth-form";
import { ToolCatalog } from "@/components/tool-catalog";
import { ToolDetail } from "@/components/tool-detail";
import { ExecutionViewer } from "@/components/execution-viewer";
import { ManifestSkeleton } from "@/components/skeletons";
import { useAppStore } from "@/stores/app-store";
import { MCPServer } from "@/shared/types";

export default function Home() {
  const {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    serverUrl,
    connect,
    disconnect,
    
    // Auth state
    requiresAuth,
    isAuthenticating,
    authError,
    authenticate,
    cancelAuth,
    
    // Tool state
    tools,
    selectedTool,
    selectTool,
    
    // Execution state
    currentExecution,
    executeTool,
    clearExecution,
    executionError,
    
    // UI state
    activeView,
    activeTab,
    
    // History
    recentServers,
  } = useAppStore();
  
  // Handle initial connection to server
  const handleConnect = (url: string) => {
    connect(url);
  };
  
  // Handle selection of a recent server
  const handleRecentServerSelect = (server: MCPServer) => {
    connect(server.url);
  };
  
  // Handle authentication
  const handleAuthenticate = (token: string, remember: boolean) => {
    authenticate(token, remember);
  };
  
  // Handle tool execution
  const handleRunTool = (inputs: Record<string, any>) => {
    if (selectedTool) {
      executeTool(selectedTool, inputs);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col">
        {/* URL Input Landing (Initial View) */}
        {activeView === "url" && (
          <div className="flex-grow flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8 space-y-4">
            {isConnecting ? (
              <ManifestSkeleton />
            ) : (
              <ServerConnectForm
                recentServers={recentServers}
                onConnect={handleConnect}
                onRecentServerSelect={handleRecentServerSelect}
              />
            )}
            {connectionError && (
              <p className="text-sm text-red-500 text-center">{connectionError}</p>
            )}
          </div>
        )}
        
        {/* Auth Form View */}
        {activeView === "auth" && (
          <div className="flex-grow flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8 space-y-4">
            {isAuthenticating ? (
              <ManifestSkeleton />
            ) : (
              <AuthForm
                serverUrl={serverUrl}
                onAuthenticate={handleAuthenticate}
                onCancel={cancelAuth}
              />
            )}
            {authError && (
              <p className="text-sm text-red-500 text-center">{authError}</p>
            )}
          </div>
        )}
        
        {/* Main Application View */}
        {activeView === "main" && (
          <div className="flex-grow container mx-auto grid grid-cols-12 gap-4">
            {/* Tab navigation for mobile */}
            <div className="sm:hidden col-span-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-4" aria-label="Tabs">
                  <button 
                    className={`px-3 py-2 text-sm font-medium ${
                      activeTab === "catalog" 
                        ? "text-primary-600 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => useAppStore.setState({ activeTab: "catalog" })}
                  >
                    Tools
                  </button>
                  <button 
                    className={`px-3 py-2 text-sm font-medium ${
                      activeTab === "detail" 
                        ? "text-primary-600 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => useAppStore.setState({ activeTab: "detail" })}
                  >
                    Form
                  </button>
                  <button 
                    className={`px-3 py-2 text-sm font-medium ${
                      activeTab === "output" 
                        ? "text-primary-600 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => useAppStore.setState({ activeTab: "output" })}
                  >
                    Output
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Desktop layout (side by side) */}
            <div className="col-span-12 grid grid-cols-12 gap-4 flex-grow">
              {/* Left Panel (Tools Catalog + Tool Detail) */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Catalog view */}
                {(activeTab === "catalog" || !selectedTool) && (
                  <ToolCatalog
                    tools={tools}
                    connectedServer={serverUrl}
                    onToolSelect={selectTool}
                    onDisconnect={disconnect}
                  />
                )}
                
                {/* Tool detail view */}
                {activeTab === "detail" && selectedTool && (
                  <ToolDetail
                    tool={selectedTool}
                    onBackToTools={() => useAppStore.setState({ activeTab: "catalog" })}
                    onRunTool={handleRunTool}
                    isRunning={currentExecution?.status === "running"}
                  />
                )}
              </div>
              
              {/* Right Panel (Execution Viewer) */}
              <div
                className={`col-span-12 md:col-span-8 lg:col-span-9 bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden ${
                  activeTab === "output" || activeTab === "detail" ? "flex" : "hidden sm:flex"
                }`}
              >
                <ExecutionViewer
                  execution={currentExecution}
                  onClear={clearExecution}
                />
              </div>
            </div>
            {executionError && (
              <p className="col-span-12 text-center text-red-500 text-sm">{executionError}</p>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
