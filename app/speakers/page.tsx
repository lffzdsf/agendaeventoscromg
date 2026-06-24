import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { speakers } from "@/lib/data";

export default function SpeakersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Palestrantes"
        title="Base de palestrantes e alinhamento"
        description="Cadastre contatos, mini currículo, pasta de Drive e estágio de alinhamento para cada convidado."
        actionLabel="Novo palestrante"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {speakers.map((speaker) => (
          <Card key={speaker.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{speaker.name}</CardTitle>
                  <CardDescription>{speaker.registration}</CardDescription>
                </div>
                <Badge variant="success">{speaker.alignmentStatus}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{speaker.bio}</p>
              <div className="mt-4 grid gap-2 text-sm">
                <p>{speaker.phone}</p>
                <p>{speaker.email}</p>
                <p>{speaker.city}</p>
              </div>
              <Button className="mt-4" asChild variant="outline">
                <a href={speaker.driveUrl} target="_blank" rel="noreferrer">
                  Abrir pasta no Drive
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
