import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { events, tasks } from "@/lib/data";

const columns = ["A fazer", "Em andamento", "Em aprovação", "Concluído"];

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Kanban de tarefas"
        description="Acompanhe a produção de cada evento por categoria, responsável, prazo e prioridade."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {columns.map((column) => (
          <Card key={column}>
            <CardHeader>
              <CardTitle>{column}</CardTitle>
              <CardDescription>
                {tasks.filter((task) => task.status === column).length} tarefa(s) nessa etapa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks
                .filter((task) => task.status === column)
                .map((task) => {
                  const event = events.find((item) => item.id === task.eventId);
                  return (
                    <div key={task.id} className="rounded-2xl border border-border/80 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{task.title}</p>
                        <Badge variant={task.priority === "Alta" ? "danger" : "warning"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{task.category}</p>
                      <p className="mt-1 text-sm">{event?.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {task.owner} • prazo {task.dueDate}
                      </p>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
