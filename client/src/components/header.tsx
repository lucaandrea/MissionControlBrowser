import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAppStore } from "@/stores/app-store";
import { Moon, Sun, History, Settings, LogOut } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { disconnect, isConnected, serverUrl } = useAppStore();

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">MCP Browser</span>
          <span className="text-xs bg-primary-100 dark:bg-primary-700 text-primary-700 dark:text-primary-100 px-2 py-1 rounded-full">v0.1</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="View history"
          >
            <History className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            aria-label="Settings"
          >
            <Settings className="h-[1.2rem] w-[1.2rem]" />
          </Button>
          
          {isConnected && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={disconnect}
              aria-label="Disconnect"
              title={`Disconnect from ${serverUrl}`}
            >
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
