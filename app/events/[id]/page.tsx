import Link from "next/link";
import { notFound } from "next/navigation";

import { EventSheetSyncControls } from "@/components/google/event-sheet-sync-controls";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getGoogleWorkspaceConfig,
  getSpreadsheetBindingForEvent
} from "@/lib/google-workspace";
import { getProgramByEvent, getTasksByEvent } from "@/lib/data";
import { getStoredEventById } from "@/lib/events-store";

function buildGoogleCalendarUrl({
  title,
  details,
  location,
  startDate,
  endDate,
  startTime,
  endTime
}: {
  title: string;
  details: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}) {
  const start = `${startDate.replaceAll("-", "")}T${startTime.replace(":", "")}00`;
  const end = `${endDate.replaceAll("-", "")}T${endTime.replace(":", "")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details,
    location,
    dates: `${start}/${end}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getStoredEventById(id);

  if (!event) {
    notFound();
  }

  const eventTasks = getTasksByEvent(id);
  const eventProgram = getProgramByEvent(id);
  const googleWorkspace = getGoogleWorkspaceConfig();
  const spreadsheetBinding = await getSpreadsheetBindingForEvent(id);
  const googleCalendarUrl = buildGoogleCalendarUrl({
    title: event.name,
    details: `${event.description}\nPágina: ${event.pageUrl ?? "-"}\nInscrição: ${event.registrationUrl ?? "-"}\nDrive: ${event.driveUrl ?? "-"}`,
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={event.type}
        title={event.name}
        description={event.description}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{event.city}</Badge>
        <Badge variant={event.priority === "Alta" ? "danger" : "warning"}>{event.priority}</Badge>
        <Badge variant="default">{event.status}</Badge>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dados do evento</CardTitle>
            <CardDescription>Campos principais do cadastro institucional.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-semibold">
                {event.startDate} a {event.endDate}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-semibold">
                {event.startTime} às {event.endTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Local</p>
              <p className="font-semibold">{event.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Responsável</p>
              <p className="font-semibold">{event.owner}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Público-alvo</p>
              <p className="font-semibold">{event.audience}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-semibold">{event.address}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
            <CardDescription>
              Links úteis para operação, divulgação, agenda e planilha do evento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={googleCalendarUrl} target="_blank" rel="noreferrer">
                  Adicionar ao Google Agenda
                </a>
              </Button>
              {event.pageUrl ? (
                <Button asChild variant="outline">
                  <a href={event.pageUrl} target="_blank" rel="noreferrer">
                    Abrir página
                  </a>
                </Button>
              ) : null}
              {event.registrationUrl ? (
                <Button asChild variant="outline">
                  <a href={event.registrationUrl} target="_blank" rel="noreferrer">
                    Abrir inscrição
                  </a>
                </Button>
              ) : null}
              {event.driveUrl ? (
                <Button asChild variant="outline">
                  <a href={event.driveUrl} target="_blank" rel="noreferrer">
                    Pasta no Drive
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="ghost">
                <Link href="/tasks">Ver tarefas</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/events/${id}/editar`}>Editar evento</Link>
              </Button>
            </div>

            {googleWorkspace.configured ? (
              <EventSheetSyncControls
                eventId={id}
                initialSpreadsheetUrl={spreadsheetBinding?.spreadsheetUrl ?? null}
                initialSyncedAt={spreadsheetBinding?.syncedAt ?? null}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 p-4">
                <p className="font-medium">Integração Google Sheets pendente</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure `GOOGLE_APPS_SCRIPT_WEB_APP_URL` para habilitar a criação e sincronização automática da planilha do evento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Programação</CardTitle>
            <CardDescription>Itens vinculados com palestrantes e materiais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventProgram.length ? (
              eventProgram.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/80 p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.date} • {item.startTime} às {item.endTime} • {item.room}
                  </p>
                  <p className="mt-2 text-sm">{item.speakerName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum item de programação cadastrado.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas do evento</CardTitle>
            <CardDescription>Entregas em andamento e pendências críticas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventTasks.length ? (
              eventTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-border/80 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{task.title}</p>
                    <Badge variant={task.status === "Atrasado" ? "danger" : "warning"}>{task.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {task.category} • {task.owner} • prazo {task.dueDate}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa vinculada.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Observações internas</CardTitle>
          <CardDescription>Notas operacionais e contexto do evento.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted-foreground">{event.notes}</p>
        </CardContent>
      </Card>
    </div>
  );
}
