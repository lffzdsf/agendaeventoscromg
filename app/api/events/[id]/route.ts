import { NextResponse } from "next/server";

import type { EventItem } from "@/lib/data";
import { getGoogleWorkspaceConfig, syncSpreadsheetForEvent } from "@/lib/google-workspace";
import { getStoredEventById, saveEvent } from "@/lib/events-store";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const existing = await getStoredEventById(id);

  if (!existing) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const input = (await request.json()) as EventItem;
  const saved = await saveEvent({ ...input, id });
  const googleWorkspace = getGoogleWorkspaceConfig();

  if (googleWorkspace.configured) {
    try {
      await syncSpreadsheetForEvent(saved.id);
    } catch (error) {
      console.warn("Nao foi possivel sincronizar a planilha do evento apos a edicao.", error);
    }
  }

  return NextResponse.json({ event: saved });
}
