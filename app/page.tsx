import Link from "next/link";
import { ArrowRight, CalendarClock, CircleAlert, Clock3, Layers3, Ticket } from "lucide-react";

import { HomeCalendarHero } from "@/components/home/home-calendar-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { program, stats, tasks } from "@/lib/data";
import { getAllEvents } from "@/lib/events-store";

const summaryCards = [
  {
    label: "Total de eventos",
    value: stats.totalEvents,
    icon: Layers3,
    tone: "info" as const
  },
  {
    label: "Eventos do mês",
    value: stats.monthEvents,
    icon: CalendarClock,
    tone: "success" as const
  },
  {
    label: "Tarefas atrasadas",
    value: stats.delayedTasks,
    icon: CircleAlert,
    tone: "danger" as const
  },
  {
    label: "Em andamento",
    value: stats.inProgressTasks,
    icon: Clock3,
    tone: "warning" as const
  }
];

export default async function DashboardPage() {
  const events = await getAllEvents();

  return (
    <div className="space-y-6">
      <HomeCalendarHero events={events} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-3xl font-bold">{item.value}</p>
                </div>
                <div className="rounded-2xl bg-secondary p-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <CardTitle>Eventos em destaque</CardTitle>
            <CardDescription>Próximos eventos com status e pendências principais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/80 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <Badge variant={event.priority === "Alta" ? "danger" : "info"}>{event.priority}</Badge>
                    <Badge variant="default">{event.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.city} • {event.startDate} • {event.owner}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/events/${event.id}`}>
                    Abrir evento
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores rápidos</CardTitle>
            <CardDescription>Lacunas operacionais para acompanhamento diário.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Sem página criada</p>
              <p className="mt-1 text-2xl font-bold">{stats.noPageEvents}</p>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Sem divulgação iniciada</p>
              <p className="mt-1 text-2xl font-bold">{stats.noCommunicationEvents}</p>
            </div>
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-sm text-muted-foreground">Sem programação completa</p>
              <p className="mt-1 text-2xl font-bold">{stats.incompleteProgram}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tarefas críticas</CardTitle>
            <CardDescription>Fila atual de execução por prioridade e prazo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-border/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{task.title}</p>
                  <Badge variant={task.status === "Atrasado" ? "danger" : "warning"}>{task.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {task.category} • {task.owner} • prazo {task.dueDate}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programação resumida</CardTitle>
            <CardDescription>Palestras e atividades já vinculadas aos eventos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {program.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-2xl border border-border/80 p-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.date} • {item.startTime} às {item.endTime} • {item.room}
                  </p>
                  <p className="mt-2 text-sm">{item.speakerName}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
