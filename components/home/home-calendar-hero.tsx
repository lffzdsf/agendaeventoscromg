"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EventItem } from "@/lib/data";

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric"
});

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function parseDateParts(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function eventOccursInMonth(event: EventItem, monthDate: Date) {
  const start = new Date(`${event.startDate}T00:00:00`);
  return (
    start.getFullYear() === monthDate.getFullYear() &&
    start.getMonth() === monthDate.getMonth()
  );
}

export function HomeCalendarHero({ events }: { events: EventItem[] }) {
  const initialMonth = React.useMemo(() => {
    const firstEvent = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
    if (!firstEvent) {
      return new Date();
    }

    const { year, month } = parseDateParts(firstEvent.startDate);
    return new Date(year, month - 1, 1);
  }, [events]);

  const [currentMonth, setCurrentMonth] = React.useState(initialMonth);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstWeekday = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const visibleEvents = React.useMemo(
    () =>
      events
        .filter((event) => eventOccursInMonth(event, currentMonth))
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [currentMonth, events]
  );

  const monthCells = Array.from({ length: 42 }).map((_, index) => {
    const dayNumber = index - firstWeekday + 1;
    const inMonth = dayNumber > 0 && dayNumber <= daysInMonth;
    const matchingEvent = visibleEvents.find((event) => parseDateParts(event.startDate).day === dayNumber);

    return {
      key: `${currentMonth.toISOString()}-${index}`,
      dayNumber,
      inMonth,
      matchingEvent
    };
  });

  return (
    <Card className="overflow-hidden border-none bg-transparent shadow-none">
      <CardContent className="grid gap-6 rounded-[32px] border bg-card/85 p-6 shadow-panel backdrop-blur md:p-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold capitalize md:text-5xl">
                {monthFormatter.format(currentMonth)}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                Visualize a agenda mensal do CRO-MG logo na entrada e navegue pelos próximos meses sem sair da home.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                  )
                }
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-sm md:gap-3">
            {weekdayLabels.map((label) => (
              <div key={label} className="px-1 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {label}
              </div>
            ))}

            {monthCells.map((cell) => (
              <div
                key={cell.key}
                className={[
                  "min-h-24 rounded-2xl border border-border/70 p-2 md:min-h-28 xl:min-h-32",
                  cell.inMonth ? "bg-card" : "bg-secondary/50 opacity-45"
                ].join(" ")}
              >
                {cell.inMonth ? (
                  <>
                    <p className="text-xs font-medium text-muted-foreground">{cell.dayNumber}</p>
                    {cell.matchingEvent ? (
                      <Link
                        href={`/events/${cell.matchingEvent.id}`}
                        className="mt-2 block rounded-xl bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/15"
                      >
                        <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em]">
                          {cell.matchingEvent.type}
                        </p>
                        <p className="mt-1 overflow-hidden text-sm font-medium leading-5 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                          {cell.matchingEvent.name}
                        </p>
                      </Link>
                    ) : null}
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] bg-secondary/55 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Eventos do mês</p>
              <p className="text-sm text-muted-foreground">
                {visibleEvents.length
                  ? `${visibleEvents.length} evento(s) programado(s)`
                  : "Nenhum evento nesse mês"}
              </p>
            </div>
            <Badge variant="info" className="capitalize">
              {monthFormatter.format(currentMonth)}
            </Badge>
          </div>

          <div className="space-y-3">
            {visibleEvents.length ? (
              visibleEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-2xl border border-border/80 bg-card/90 p-4 transition-colors hover:bg-card"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold">{event.name}</p>
                    <Badge variant={event.status === "Inscrições abertas" ? "success" : "warning"}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {event.startDate} • {event.startTime} às {event.endTime}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.city} • {event.location}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 p-5 text-sm text-muted-foreground">
                Navegue para outros meses para consultar a agenda prevista.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
