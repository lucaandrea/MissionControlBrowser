import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToolExecution } from "@/shared/types";
import { formatExecutionTime, renderResponse, determineResponseType } from "@/lib/response-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExecutionViewerProps {
  execution?: ToolExecution;
  onClear: () => void;
}

export function ExecutionViewer({ execution, onClear }: ExecutionViewerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("result");
  
  if (!execution) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <p>Run a tool to see results here</p>
      </div>
    );
  }
  
  const handleCopyOutput = () => {
    let content = "";
    
    if (activeTab === "result" && execution.outputs) {
      content = typeof execution.outputs === "string" 
        ? execution.outputs 
        : JSON.stringify(execution.outputs, null, 2);
    } else if (activeTab === "console") {
      content = execution.logs.join("\n");
    } else if (activeTab === "raw" && execution.outputs) {
      content = JSON.stringify(execution.outputs, null, 2);
    }
    
    if (content) {
      navigator.clipboard.writeText(content)
        .then(() => {
          toast({
            title: "Copied to clipboard",
            description: "Output has been copied to your clipboard",
          });
        })
        .catch((err) => {
          toast({
            title: "Copy failed",
            description: "Failed to copy to clipboard: " + err.message,
            variant: "destructive",
          });
        });
    }
  };
  
  const handleDownloadOutput = () => {
    let content = "";
    let filename = `${execution.toolSlug}-output.json`;
    let type = "application/json";
    
    if (activeTab === "result" && execution.outputs) {
      if (typeof execution.outputs === "string") {
        content = execution.outputs;
        filename = `${execution.toolSlug}-output.txt`;
        type = "text/plain";
      } else {
        content = JSON.stringify(execution.outputs, null, 2);
      }
    } else if (activeTab === "console") {
      content = execution.logs.join("\n");
      filename = `${execution.toolSlug}-logs.txt`;
      type = "text/plain";
    } else if (activeTab === "raw" && execution.outputs) {
      content = JSON.stringify(execution.outputs, null, 2);
    }
    
    if (content) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };
  
  // Determine status indicator color
  const statusIndicator = execution.status === "completed" 
    ? "bg-green-500" 
    : execution.status === "error" 
      ? "bg-red-500" 
      : "bg-yellow-500 animate-pulse";
  
  // Format status text
  const statusText = execution.status === "completed" && execution.duration !== undefined
    ? `Completed in ${formatExecutionTime(execution.duration)}`
    : execution.status === "error"
      ? "Failed"
      : "Running...";
  
  return (
    <div className="flex flex-col h-full">
      {/* Output controls */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</h3>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyOutput}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy to clipboard</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadOutput}
            title="Download result"
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download result</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            title="Clear output"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Clear output</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="bg-white dark:bg-gray-800 px-4 border-b border-gray-200 dark:border-gray-700">
          <TabsList className="h-9 px-0 bg-transparent">
            <TabsTrigger value="result" className="rounded-none">Result</TabsTrigger>
            <TabsTrigger value="console" className="rounded-none">Console</TabsTrigger>
            <TabsTrigger value="raw" className="rounded-none">Raw JSON</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Execution status */}
        <div className="bg-white dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <span className={`h-2 w-2 rounded-full ${statusIndicator} mr-2`} aria-hidden="true"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{statusText}</span>
          </div>
        </div>
        
        {/* Tab content */}
        <TabsContent value="result" className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-800 m-0 border-0">
          {execution.outputs ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {renderOutput(execution.outputs)}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              {execution.status === "running" ? "Waiting for results..." : "No output available"}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="console" className="flex-1 overflow-auto p-4 bg-gray-900 m-0 border-0">
          <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
            {execution.logs.length > 0 
              ? execution.logs.join("\n") 
              : "No logs available"
            }
          </pre>
        </TabsContent>
        
        <TabsContent value="raw" className="flex-1 overflow-auto p-4 bg-gray-900 m-0 border-0">
          <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
            {execution.outputs
              ? JSON.stringify(execution.outputs, null, 2)
              : "No data available"
            }
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper to render output based on type
function renderOutput(output: any) {
  const type = determineResponseType(output);
  
  switch (type) {
    case "markdown":
      return (
        <div className="markdown">
          {output}
        </div>
      );
      
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {Object.keys(output[0]).map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {output.map((row: any, rowIndex: number) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], colIndex) => (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                    >
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      
    default:
      return renderResponse(output);
  }
}
