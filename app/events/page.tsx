import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllEvents } from "@/lib/events-store";

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Eventos"
        title="Lista de eventos"
        description="Acompanhe todos os eventos do CRO-MG com status, prioridade, cidade, links e responsável."
        actionLabel="Cadastrar evento"
        actionHref="/eventos/novo"
      />

      <Card>
        <CardHeader>
          <CardTitle>Eventos cadastrados</CardTitle>
          <CardDescription>Base pronta para substituir a planilha manual por uma experiência mais visual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-4 rounded-2xl border border-border/80 p-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <p className="font-semibold">{event.name}</p>
                  <Badge variant="info">{event.type}</Badge>
                  <Badge variant={event.priority === "Alta" ? "danger" : "warning"}>{event.priority}</Badge>
                  <Badge variant="default">{event.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.city} • {event.startDate} a {event.endDate} • responsável {event.owner}
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline">
                  <Link href={`/events/${event.id}`}>Ver detalhes</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={`/events/${event.id}/editar`}>Editar</Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
