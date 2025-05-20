import { DirectoryServer } from "@/shared/types";

const DB_NAME = "mcp-browser";
const STORE_NAME = "server-directory";
const STORE_KEY = "data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function loadFromCache(): Promise<{ timestamp: number; data: DirectoryServer[] } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(STORE_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function saveToCache(data: DirectoryServer[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ timestamp: Date.now(), data }, STORE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function fetchFromGitHub(): Promise<DirectoryServer[]> {
  const res = await fetch(
    "https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/servers.json",
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch directory: ${res.status}`);
  }
  return await res.json();
}

async function fetchFromMcpServers(): Promise<DirectoryServer[]> {
  const res = await fetch("https://mcpservers.org");
  if (!res.ok) {
    throw new Error(`Failed to fetch directory HTML: ${res.status}`);
  }
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, "text/html");
  const rows = Array.from(doc.querySelectorAll("tr"));
  const servers: DirectoryServer[] = [];

  for (const row of rows) {
    const name = row.querySelector(".name")?.textContent?.trim();
    const url = row.querySelector("a[href^='http']")?.getAttribute("href") || "";
    const tagsText = row.querySelector(".tags")?.textContent || "";
    if (url) {
      servers.push({
        name: name || url,
        url,
        tags: tagsText
          .split(/[,\s]+/)
          .map((t) => t.trim())
          .filter(Boolean),
      });
    }
  }

  return servers;
}

/** Fetch the directory, using cache if available */
export async function getServerDirectory(forceRefresh = false): Promise<DirectoryServer[]> {
  if (!forceRefresh) {
    try {
      const cached = await loadFromCache();
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
    } catch {
      // ignore cache errors
    }
  }

  let data: DirectoryServer[] = [];
  try {
    data = await fetchFromGitHub();
  } catch {
    try {
      data = await fetchFromMcpServers();
    } catch {
      data = [];
    }
  }

  if (data.length) {
    try {
      await saveToCache(data);
    } catch {
      // ignore cache errors
    }
  }

  return data;
}

export async function pingServer(url: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(`${url.replace(/\/$/, "")}/manifest`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}

export type { DirectoryServer } from "@/shared/types";

