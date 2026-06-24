import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationChecklist } from "@/lib/data";

export default function CommunicationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Comunicação"
        title="Controle de divulgação e materiais"
        description="Acompanhe página do evento, cards, stories, legendas, e-mail marketing, WhatsApp e certificados."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status de comunicação</CardTitle>
            <CardDescription>Checklist institucional por peça de divulgação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {communicationChecklist.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/80 p-4">
                <p className="font-medium">{item.label}</p>
                <Badge variant={item.status === "Concluído" ? "success" : "warning"}>{item.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fluxo recomendado</CardTitle>
            <CardDescription>Sequência operacional para publicar e acompanhar cada campanha.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              "Criar página do evento e texto base",
              "Definir card principal e cards individuais",
              "Aprovar legendas e stories",
              "Publicar inscrição e CTA",
              "Disparar e-mail marketing",
              "Agendar pós-evento e certificados"
            ].map((step, index) => (
              <div key={step} className="rounded-2xl bg-secondary p-4">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Etapa {index + 1}
                </p>
                <p className="mt-2 font-semibold">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
