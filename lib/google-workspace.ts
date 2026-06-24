import {
  getStoredSpreadsheetForEvent,
  listStoredSpreadsheets,
  saveStoredSpreadsheetForEvent
} from "@/lib/google-sync-store";
import {
  communicationChecklist,
  events,
  getProgramByEvent,
  getTasksByEvent,
  speakers,
  vendors
} from "@/lib/data";
import { getStoredEventById } from "@/lib/events-store";

const REQUIRED_ENV_VARS = ["GOOGLE_APPS_SCRIPT_WEB_APP_URL"] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

type EventSheetRow = {
  sheetName: string;
  headers: string[];
  rows: string[][];
};

type AppsScriptResponse = {
  ok?: boolean;
  error?: string;
  mode?: "created" | "synced";
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  syncedAt?: string;
  title?: string;
};

type ValidAppsScriptResponse = {
  mode: "created" | "synced";
  spreadsheetId: string;
  spreadsheetUrl: string;
  syncedAt: string;
  title: string;
};

type SpreadsheetSyncResult = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  syncedAt: string;
  mode: "created" | "synced";
};

type SyncSpreadsheetOptions = {
  createIfMissing?: boolean;
};

type EventSheetPayload = Awaited<ReturnType<typeof buildEventPayload>>;

export function getGoogleWorkspaceConfig() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]) as RequiredEnvVar[];

  return {
    configured: missing.length === 0,
    missing,
    webAppUrl: process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL ?? "",
    sharedSecretConfigured: Boolean(process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET),
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? ""
  };
}

function buildSpreadsheetTitle(eventName: string) {
  return `${eventName} | CRO-MG`;
}

async function buildEventPayload(eventId: string) {
  const event = await getStoredEventById(eventId);

  if (!event) {
    throw new Error("Evento não encontrado.");
  }

  const eventProgram = getProgramByEvent(eventId);
  const eventTasks = getTasksByEvent(eventId);
  const relatedSpeakerNames = new Set(eventProgram.map((item) => item.speakerName));
  const relatedSpeakers = speakers.filter((speaker) => relatedSpeakerNames.has(speaker.name));

  const sheets: EventSheetRow[] = [
    {
      sheetName: "Eventos",
      headers: [
        "Evento ID",
        "Nome do evento",
        "Tipo",
        "Cidade",
        "Local",
        "Endereço",
        "Data de início",
        "Data de fim",
        "Horário de início",
        "Horário de fim",
        "Público-alvo",
        "Descrição",
        "Responsável interno",
        "Status",
        "Prioridade",
        "Link da página",
        "Link de inscrição",
        "Pasta Drive",
        "Observações internas"
      ],
      rows: [
        [
          event.id,
          event.name,
          event.type,
          event.city,
          event.location,
          event.address,
          event.startDate,
          event.endDate,
          event.startTime,
          event.endTime,
          event.audience,
          event.description,
          event.owner,
          event.status,
          event.priority,
          event.pageUrl ?? "",
          event.registrationUrl ?? "",
          event.driveUrl ?? "",
          event.notes
        ]
      ]
    },
    {
      sheetName: "Programacao",
      headers: [
        "Evento ID",
        "Evento",
        "Data",
        "Horário de início",
        "Horário de fim",
        "Sala/Auditório",
        "Título",
        "Tipo de atividade",
        "Palestrante",
        "Registro profissional",
        "Contato",
        "Observações",
        "Link foto/titulação",
        "Pasta Drive",
        "Card individual",
        "Legenda"
      ],
      rows: eventProgram.map((item) => [
        event.id,
        event.name,
        item.date,
        item.startTime,
        item.endTime,
        item.room,
        item.title,
        item.activityType,
        item.speakerName,
        item.speakerRegistration,
        item.contact,
        item.notes,
        item.photoUrl ?? "",
        item.driveUrl ?? "",
        item.cardName ?? "",
        item.caption ?? ""
      ])
    },
    {
      sheetName: "Palestrantes",
      headers: [
        "Evento ID",
        "Evento",
        "Nome",
        "Registro profissional",
        "Telefone/WhatsApp",
        "E-mail",
        "Cidade",
        "Mini currículo",
        "Foto",
        "Pasta no Drive",
        "Status do alinhamento",
        "Observações"
      ],
      rows: relatedSpeakers.map((speaker) => [
        event.id,
        event.name,
        speaker.name,
        speaker.registration,
        speaker.phone,
        speaker.email,
        speaker.city,
        speaker.bio,
        "",
        speaker.driveUrl ?? "",
        speaker.alignmentStatus,
        ""
      ])
    },
    {
      sheetName: "Tarefas",
      headers: [
        "Evento ID",
        "Evento",
        "Título",
        "Categoria",
        "Responsável",
        "Prazo",
        "Prioridade",
        "Status",
        "Descrição",
        "Comentários"
      ],
      rows: eventTasks.map((task) => [
        event.id,
        event.name,
        task.title,
        task.category,
        task.owner,
        task.dueDate,
        task.priority,
        task.status,
        "",
        ""
      ])
    },
    {
      sheetName: "Fornecedores",
      headers: ["Evento ID", "Evento", "Fornecedor", "Categoria", "Status", "Contato"],
      rows: vendors.map((vendor) => [
        event.id,
        event.name,
        vendor.name,
        vendor.category,
        vendor.status,
        vendor.contact
      ])
    },
    {
      sheetName: "Comunicacao",
      headers: ["Evento ID", "Evento", "Item", "Status"],
      rows: communicationChecklist.map((item) => [event.id, event.name, item.label, item.status])
    }
  ];

  return {
    eventId: event.id,
    eventName: event.name,
    spreadsheetTitle: buildSpreadsheetTitle(event.name),
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? "",
    event: {
      id: event.id,
      name: event.name,
      type: event.type,
      city: event.city,
      location: event.location,
      address: event.address,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      audience: event.audience,
      description: event.description,
      owner: event.owner,
      status: event.status,
      priority: event.priority,
      pageUrl: event.pageUrl ?? "",
      registrationUrl: event.registrationUrl ?? "",
      driveUrl: event.driveUrl ?? "",
      notes: event.notes
    },
    sheets
  };
}

async function callAppsScript(
  mode: "create" | "sync",
  payload: EventSheetPayload,
  spreadsheetId?: string
): Promise<ValidAppsScriptResponse> {
  const config = getGoogleWorkspaceConfig();

  if (!config.configured) {
    throw new Error(
      `Integração Apps Script incompleta. Defina: ${config.missing.join(", ")}.`
    );
  }

  const response = await fetch(config.webAppUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: mode,
      secret: process.env.GOOGLE_APPS_SCRIPT_SHARED_SECRET ?? "",
      eventId: payload.eventId,
      spreadsheetId: spreadsheetId ?? "",
      folderId: payload.folderId,
      spreadsheetTitle: payload.spreadsheetTitle,
      event: payload.event,
      sheets: payload.sheets
    }),
    cache: "no-store"
  });

  const result = (await response.json().catch(() => ({}))) as AppsScriptResponse;

  if (!response.ok || !result.spreadsheetId || !result.spreadsheetUrl) {
    throw new Error(
      result.error ?? "O Apps Script não retornou a planilha esperada."
    );
  }

  return {
    mode: result.mode ?? (mode === "create" ? "created" : "synced"),
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    syncedAt: result.syncedAt ?? new Date().toISOString(),
    title: result.title ?? payload.spreadsheetTitle
  };
}

async function fetchBindingFromAppsScript(eventId: string) {
  const config = getGoogleWorkspaceConfig();

  if (!config.configured) {
    return null;
  }

  const url = new URL(config.webAppUrl);
  url.searchParams.set("resource", "binding");
  url.searchParams.set("eventId", eventId);

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });

  const result = (await response.json().catch(() => ({}))) as AppsScriptResponse;

  if (!response.ok || result.ok === false) {
    return null;
  }

  if (!result.spreadsheetId || !result.spreadsheetUrl) {
    return null;
  }

  return {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    title: result.title ?? "",
    syncedAt: result.syncedAt ?? ""
  };
}

export async function createSpreadsheetForEvent(
  eventId: string
): Promise<SpreadsheetSyncResult> {
  const existingBinding =
    (await fetchBindingFromAppsScript(eventId)) ?? (await getStoredSpreadsheetForEvent(eventId));

  if (existingBinding) {
    return syncSpreadsheetForEvent(eventId);
  }

  const payload = buildEventPayload(eventId);
  const awaitedPayload = await payload;
  const result = await callAppsScript("create", awaitedPayload);
  const stored = await saveStoredSpreadsheetForEvent(eventId, {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    title: result.title,
    syncedAt: result.syncedAt
  });

  return {
    ...stored,
    mode: result.mode
  };
}

export async function syncSpreadsheetForEvent(
  eventId: string,
  options: SyncSpreadsheetOptions = {}
): Promise<SpreadsheetSyncResult> {
  const payload = buildEventPayload(eventId);
  const awaitedPayload = await payload;
  const stored =
    (await fetchBindingFromAppsScript(eventId)) ?? (await getStoredSpreadsheetForEvent(eventId));

  if (!stored) {
    if (options.createIfMissing) {
      return createSpreadsheetForEvent(eventId);
    }

    throw new Error(
      "Nenhuma planilha vinculada foi encontrada para este evento no Google Drive."
    );
  }

  const result = await callAppsScript("sync", awaitedPayload, stored.spreadsheetId);
  const updated = await saveStoredSpreadsheetForEvent(eventId, {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    title: result.title,
    syncedAt: result.syncedAt
  });

  return {
    ...updated,
    mode: result.mode
  };
}

export async function getSpreadsheetBindingForEvent(eventId: string) {
  return (
    (await fetchBindingFromAppsScript(eventId)) ?? (await getStoredSpreadsheetForEvent(eventId))
  );
}

export async function getGoogleWorkspaceSummary() {
  const config = getGoogleWorkspaceConfig();
  const bindings = await listStoredSpreadsheets();

  return {
    ...config,
    totalEventosBase: events.length,
    totalPlanilhasVinculadas: Object.keys(bindings).length
  };
}
