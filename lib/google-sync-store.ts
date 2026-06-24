import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type StoredSpreadsheet = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  syncedAt: string;
};

type SyncStore = {
  events: Record<string, StoredSpreadsheet>;
};

const STORE_DIR = path.join(process.cwd(), "work");
const STORE_FILE = path.join(STORE_DIR, "google-sync-store.json");

async function ensureStoreFile() {
  await mkdir(STORE_DIR, { recursive: true });

  try {
    await readFile(STORE_FILE, "utf8");
  } catch {
    await writeFile(STORE_FILE, JSON.stringify({ events: {} }, null, 2), "utf8");
  }
}

async function readStore(): Promise<SyncStore> {
  await ensureStoreFile();
  const content = await readFile(STORE_FILE, "utf8");
  return JSON.parse(content) as SyncStore;
}

async function writeStore(store: SyncStore) {
  await ensureStoreFile();
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function getStoredSpreadsheetForEvent(eventId: string) {
  const store = await readStore();
  return store.events[eventId] ?? null;
}

export async function saveStoredSpreadsheetForEvent(
  eventId: string,
  spreadsheet: StoredSpreadsheet
) {
  const store = await readStore();
  store.events[eventId] = spreadsheet;
  await writeStore(store);
  return store.events[eventId];
}

export async function listStoredSpreadsheets() {
  const store = await readStore();
  return store.events;
}
