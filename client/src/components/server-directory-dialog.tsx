import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useAppStore } from "@/stores/app-store";
import { DirectoryServer, pingServer } from "@/lib/directory";

interface BrowseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function ServerDirectoryDialog({
  open,
  onOpenChange,
  onSelect,
}: BrowseDialogProps) {
  const { serverDirectory, loadServerDirectory } = useAppStore();
  const [status, setStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open && serverDirectory.length === 0) {
      loadServerDirectory();
    }
  }, [open, serverDirectory.length, loadServerDirectory]);

  useEffect(() => {
    if (!open) return;
    serverDirectory.forEach((s) => {
      pingServer(s.url).then((online) =>
        setStatus((prev) => ({ ...prev, [s.url]: online }))
      );
    });
  }, [open, serverDirectory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Browse MCP Servers</DialogTitle>
          <DialogDescription>
            Select a server to connect.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {serverDirectory.map((server) => (
                <TableRow key={server.url}>
                  <TableCell>{server.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {server.url}
                  </TableCell>
                  <TableCell>
                    {server.tags?.map((t) => (
                      <span
                        key={t}
                        className="mr-1 inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </TableCell>
                  <TableCell>
                    {status[server.url] == null
                      ? "..."
                      : status[server.url]
                      ? "Online"
                      : "Offline"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => onSelect(server.url)}>
                      Connect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

