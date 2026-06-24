import { NextResponse } from "next/server";

import type { EventItem } from "@/lib/data";
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
  return NextResponse.json({ event: saved });
}
