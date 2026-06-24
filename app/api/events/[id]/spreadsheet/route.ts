import { NextResponse } from "next/server";

import {
  createSpreadsheetForEvent,
  getGoogleWorkspaceConfig,
  syncSpreadsheetForEvent
} from "@/lib/google-workspace";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const config = getGoogleWorkspaceConfig();
  const body = (await request.json().catch(() => ({}))) as { mode?: "create" | "sync" };
  const mode = body.mode === "sync" ? "sync" : "create";

  if (!config.configured) {
    return NextResponse.json(
      {
        error:
          "Integração Apps Script não configurada. Preencha a variável GOOGLE_APPS_SCRIPT_WEB_APP_URL."
      },
      { status: 400 }
    );
  }

  try {
    const result =
      mode === "sync"
        ? await syncSpreadsheetForEvent(id)
        : await createSpreadsheetForEvent(id);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha inesperada ao criar a planilha do evento.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
