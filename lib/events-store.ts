import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { events as seedEvents, type EventItem } from "@/lib/data";

const STORE_DIR = path.join(process.cwd(), "work");
const STORE_FILE = path.join(STORE_DIR, "events-store.json");

async function ensureStoreFile() {
  await mkdir(STORE_DIR, { recursive: true });

  try {
    await readFile(STORE_FILE, "utf8");
  } catch {
    await writeFile(STORE_FILE, JSON.stringify(seedEvents, null, 2), "utf8");
  }
}

function cloneSeedEvents() {
  return JSON.parse(JSON.stringify(seedEvents)) as EventItem[];
}

async function readEvents(): Promise<EventItem[]> {
  try {
    await ensureStoreFile();
    const content = await readFile(STORE_FILE, "utf8");
    return JSON.parse(content) as EventItem[];
  } catch {
    // In serverless deployments the filesystem can be read-only or ephemeral.
    return cloneSeedEvents();
  }
}

async function writeEvents(items: EventItem[]) {
  await ensureStoreFile();
  await writeFile(STORE_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function getAllEvents() {
  return readEvents();
}

export async function getStoredEventById(id: string) {
  const items = await readEvents();
  return items.find((event) => event.id === id) ?? null;
}

export async function saveEvent(input: EventItem) {
  const items = await readEvents();
  const index = items.findIndex((event) => event.id === input.id);

  if (index >= 0) {
    items[index] = input;
  } else {
    items.push(input);
  }

  try {
    await writeEvents(items);
  } catch (error) {
    if (process.env.VERCEL) {
      console.warn("Persistencia local indisponivel na Vercel; usando dados temporarios.", error);
      return input;
    }

    throw error;
  }

  return input;
}

export function slugifyEventName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
