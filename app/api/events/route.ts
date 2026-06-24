import { NextResponse } from "next/server";

import type { EventItem } from "@/lib/data";
import { getGoogleWorkspaceConfig, syncSpreadsheetForEvent } from "@/lib/google-workspace";
import { saveEvent, slugifyEventName } from "@/lib/events-store";

type EventInput = Omit<EventItem, "id"> & { id?: string };

export async function POST(request: Request) {
  const input = (await request.json()) as EventInput;

  if (!input.name) {
    return NextResponse.json({ error: "Nome do evento é obrigatório." }, { status: 400 });
  }

  const id = input.id?.trim() || `${slugifyEventName(input.name)}-${new Date().getFullYear()}`;
  const event: EventItem = { ...input, id };
  const saved = await saveEvent(event);
  const googleWorkspace = getGoogleWorkspaceConfig();

  if (googleWorkspace.configured) {
    try {
      await syncSpreadsheetForEvent(saved.id);
    } catch (error) {
      console.warn("Nao foi possivel sincronizar a planilha do evento apos o cadastro.", error);
    }
  }

  return NextResponse.json({ event: saved });
}
