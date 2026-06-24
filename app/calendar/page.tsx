import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllEvents } from "@/lib/events-store";

const filters = ["Tipo", "Cidade", "Responsável", "Status", "Prioridade", "Período"];

export default async function CalendarPage() {
  const events = await getAllEvents();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendário"
        title="Agenda visual dos eventos"
        description="Visualização mensal, semanal e em lista preparada para filtros por tipo, cidade, responsável, status, prioridade e período."
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Badge key={filter} variant="default">
            {filter}
          </Badge>
        ))}
      </div>

      <section className="grid gap-6 2xl:grid-cols-[1.45fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Visão mensal</CardTitle>
            <CardDescription>Distribuição dos eventos em um calendário institucional.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            <div className="grid grid-cols-7 gap-3 text-sm xl:gap-4">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="px-1 pb-2 font-semibold text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, index) => {
                const day = index - 1;
                const event = events.find(
                  (item) =>
                    Number(item.startDate.slice(-2)) === day || Number(item.endDate.slice(-2)) === day
                );
                return (
                  <div
                    key={index}
                    className="min-h-32 overflow-hidden rounded-2xl border border-border/70 p-3 xl:min-h-36 2xl:min-h-40"
                  >
                    <p className="text-xs text-muted-foreground">{day > 0 ? day : ""}</p>
                    {event ? (
                      <div className="mt-2 space-y-2 rounded-xl bg-primary/10 p-2 text-primary">
                        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em]">
                          {event.type}
                        </p>
                        <p className="overflow-hidden text-sm font-medium leading-5 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
                          {event.name}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visão em lista</CardTitle>
            <CardDescription>Próximos eventos com cor por status e tipo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="min-w-0 rounded-2xl border border-border/80 p-4">
                <div className="flex min-w-0 flex-wrap items-start gap-2">
                  <p className="min-w-0 flex-1 break-words pr-2 text-xl font-semibold leading-tight">
                    {event.name}
                  </p>
                  <Badge variant="info">{event.type}</Badge>
                  <Badge variant={event.status === "Inscrições abertas" ? "success" : "warning"}>
                    {event.status}
                  </Badge>
                </div>
                <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
                  {event.startDate} • {event.city} • {event.location}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
