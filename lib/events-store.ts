import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { events as seedEvents, type EventItem } from "@/lib/data";

const STORE_DIR = path.join(process.cwd(), "work");
const STORE_FILE = path.join(STORE_DIR, "events-store.json");
const APPS_SCRIPT_WEB_APP_URL = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;

type EventsApiResponse = {
  ok?: boolean;
  error?: string;
  events?: EventItem[];
  event?: EventItem;
};

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

function hasRemoteEventBackend() {
  return Boolean(APPS_SCRIPT_WEB_APP_URL);
}

function withSeedFallback(remoteEvents: EventItem[]) {
  const merged = new Map(cloneSeedEvents().map((event) => [event.id, event] as const));

  remoteEvents.forEach((event) => {
    merged.set(event.id, event);
  });

  return Array.from(merged.values());
}

async function fetchRemoteEvents(): Promise<EventItem[]> {
  const response = await fetch(`${APPS_SCRIPT_WEB_APP_URL}?resource=events`, {
    method: "GET",
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as EventsApiResponse;

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? "Falha ao carregar eventos do Apps Script.");
  }

  return Array.isArray(payload.events) ? payload.events : [];
}

async function upsertRemoteEvent(event: EventItem): Promise<EventItem> {
  const response = await fetch(APPS_SCRIPT_WEB_APP_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "upsertEvent",
      secret: process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET ?? "",
      event
    }),
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as EventsApiResponse;

  if (!response.ok || payload.ok === false || !payload.event) {
    throw new Error(payload.error ?? "Falha ao salvar evento no Apps Script.");
  }

  return payload.event;
}

async function readEvents(): Promise<EventItem[]> {
  if (hasRemoteEventBackend()) {
    try {
      return withSeedFallback(await fetchRemoteEvents());
    } catch {
      return cloneSeedEvents();
    }
  }

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
  if (hasRemoteEventBackend()) {
    try {
      return await upsertRemoteEvent(input);
    } catch (error) {
      if (process.env.VERCEL) {
        throw error;
      }
    }
  }

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
