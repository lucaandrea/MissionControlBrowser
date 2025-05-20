import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppStore } from "@/stores/app-store";
import { loadHistory } from "@/lib/storage";
import { History, Server, Terminal } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { recentServers, connect, tools, selectTool, isConnected } = useAppStore();
  const [executions] = useState(() => loadHistory().executions);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search tools or servers..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Servers">
          {recentServers.map((server) => (
            <CommandItem
              key={server.url}
              onSelect={() => {
                connect(server.url);
                setOpen(false);
              }}
            >
              <Server className="mr-2 h-4 w-4" />
              {server.name || server.url}
            </CommandItem>
          ))}
        </CommandGroup>
        {isConnected && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tools">
              {tools.map((tool) => (
                <CommandItem
                  key={tool.slug}
                  onSelect={() => {
                    selectTool(tool);
                    useAppStore.setState({ activeView: "main", activeTab: "detail" });
                    setOpen(false);
                  }}
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  {tool.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
        {executions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="History">
              {executions.slice(0, 5).map((ex, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => {
                    useAppStore.setState({
                      activeView: "main",
                      activeTab: "output",
                      currentExecution: ex,
                    });
                    setOpen(false);
                  }}
                >
                  <History className="mr-2 h-4 w-4" />
                  {ex.toolName}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
