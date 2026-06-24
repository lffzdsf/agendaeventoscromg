"use client";

import * as React from "react";
import { ExternalLink, LoaderCircle, RefreshCcw, Sheet } from "lucide-react";

import { Button } from "@/components/ui/button";

type SyncResponse = {
  error?: string;
  mode?: "created" | "synced";
  spreadsheetUrl?: string;
  syncedAt?: string;
};

export function EventSheetSyncControls({
  eventId,
  initialSpreadsheetUrl,
  initialSyncedAt
}: {
  eventId: string;
  initialSpreadsheetUrl?: string | null;
  initialSyncedAt?: string | null;
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = React.useState<string | null>(
    initialSpreadsheetUrl ?? null
  );
  const [syncedAt, setSyncedAt] = React.useState<string | null>(initialSyncedAt ?? null);
  const [lastAction, setLastAction] = React.useState<"created" | "synced" | null>(
    initialSpreadsheetUrl ? "synced" : null
  );

  const hasSpreadsheet = Boolean(spreadsheetUrl);

  async function submit(mode: "create" | "sync") {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/spreadsheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mode })
      });

      const data = (await response.json()) as SyncResponse;

      if (!response.ok || !data.spreadsheetUrl) {
        throw new Error(data.error ?? "Não foi possível sincronizar a planilha do evento.");
      }

      setSpreadsheetUrl(data.spreadsheetUrl);
      setSyncedAt(data.syncedAt ?? new Date().toISOString());
      setLastAction(data.mode ?? "synced");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocorreu um erro ao integrar com o Google Sheets."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => submit(hasSpreadsheet ? "sync" : "create")}
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : hasSpreadsheet ? (
            <RefreshCcw className="h-4 w-4" />
          ) : (
            <Sheet className="h-4 w-4" />
          )}
          {hasSpreadsheet ? "Sincronizar planilha" : "Criar planilha do evento"}
        </Button>

        {spreadsheetUrl ? (
          <Button asChild variant="outline">
            <a href={spreadsheetUrl} target="_blank" rel="noreferrer">
              Abrir planilha
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

      {!error ? (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            A sincronização envia os dados atuais da página para as abas de eventos,
            programação, palestrantes, tarefas, fornecedores e comunicação.
          </p>
          {lastAction === "created" ? (
            <p>A primeira criação já gravou o vínculo do evento com a planilha para evitar duplicidade.</p>
          ) : null}
          {syncedAt ? <p>Última sincronização: {new Date(syncedAt).toLocaleString("pt-BR")}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
