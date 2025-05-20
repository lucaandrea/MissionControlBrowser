import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MCPServer } from "@/shared/types";
import { useAppStore } from "@/stores/app-store";
import { formatRelativeTime } from "@/lib/response-renderer";
import { serverUrlSchema } from "@/lib/schema-validators";

// Form schema
const formSchema = z.object({
  url: serverUrlSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface ServerConnectFormProps {
  recentServers: MCPServer[];
  onConnect: (url: string) => void;
  onRecentServerSelect: (server: MCPServer) => void;
  onBrowseServers: () => void;
}

export function ServerConnectForm({
  recentServers,
  onConnect,
  onRecentServerSelect,
  onBrowseServers,
}: ServerConnectFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onConnect(values.url);
  };

  return (
    <Card className="max-w-md w-full">
      <CardContent className="pt-6 space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
            Connect to MCP Server
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter a compatible MCP server URL to explore available tools
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">MCP Server URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.example.com/mcp"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Connect
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={onBrowseServers}>
              Browse Servers
            </Button>
          </form>
        </Form>

        <div className="text-sm text-center">
          <a
            href="#"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Learn more about MCP
          </a>
        </div>

        {recentServers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Connections
            </h3>
            <ul className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
              {recentServers.map((server) => (
                <li key={server.url}>
                  <button
                    className="block w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 sm:px-6 text-sm"
                    onClick={() => onRecentServerSelect(server)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{server.url}</span>
                      {server.lastConnected && (
                        <span className="ml-2 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(server.lastConnected)}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
