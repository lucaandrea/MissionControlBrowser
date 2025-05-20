import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { MCPTool } from "@/shared/types";

interface ToolCatalogProps {
  tools: MCPTool[];
  connectedServer: string;
  onToolSelect: (tool: MCPTool) => void;
  onDisconnect: () => void;
}

export function ToolCatalog({
  tools,
  connectedServer,
  onToolSelect,
  onDisconnect,
}: ToolCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filteredTools, setFilteredTools] = useState<MCPTool[]>(tools);
  
  // Extract all unique tags from tools
  const allTags = Array.from(
    new Set(tools.flatMap((tool) => tool.tags || []))
  );
  
  // Handle search and tag filtering
  useEffect(() => {
    let filtered = tools;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          (tool.description || "").toLowerCase().includes(query) ||
          (tool.tags || []).some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by active tags
    if (activeTags.length > 0) {
      filtered = filtered.filter((tool) =>
        activeTags.some((tag) => (tool.tags || []).includes(tag))
      );
    }
    
    setFilteredTools(filtered);
  }, [tools, searchQuery, activeTags]);
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Server info */}
      <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2" aria-hidden="true"></div>
          <span className="text-sm font-medium truncate">{connectedServer}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDisconnect} className="h-7 w-7 p-0">
          <span className="sr-only">Disconnect</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </div>
      
      {/* Search and filter */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search tools..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {allTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Tool cards */}
      <div className="p-4 grid gap-4 overflow-y-auto flex-grow">
        {filteredTools.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No tools found. Try changing your search or filters.
          </div>
        ) : (
          filteredTools.map((tool) => (
            <div
              key={tool.slug}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
              onClick={() => onToolSelect(tool)}
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {tool.name}
              </h3>
              {tool.description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {tool.description}
                </p>
              )}
              {tool.tags && tool.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
