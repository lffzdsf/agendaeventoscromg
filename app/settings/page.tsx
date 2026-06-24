import { CheckCircle2, Link2, RefreshCcw, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGoogleWorkspaceSummary } from "@/lib/google-workspace";

const integrations = [
  {
    title: "Google Calendar",
    description:
      "Autenticação OAuth 2.0, criação de eventos, atualização via ID salvo e abertura direta no Google Agenda.",
    icon: Link2
  },
  {
    title: "Google Sheets",
    description:
      "Sincronização com abas Eventos, Programacao, Palestrantes, Tarefas, Fornecedores e Comunicacao.",
    icon: RefreshCcw
  },
  {
    title: "Apps Script",
    description:
      "Backend Google Workspace para criação, localização e sincronização das planilhas sem duplicidade.",
    icon: ShieldCheck
  }
];

export default async function SettingsPage() {
  const googleWorkspace = await getGoogleWorkspaceSummary();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integrações"
        title="Configurações do Google Workspace"
        description="Painel de configuração do Apps Script, sincronização com Google Sheets e vínculo das planilhas por evento."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.title}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="pt-4">{integration.title}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status da integração real</CardTitle>
          <CardDescription>
            Leitura das variáveis de ambiente para comunicação com o Web App do Apps Script.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge variant={googleWorkspace.configured ? "success" : "warning"}>
              {googleWorkspace.configured ? "Google configurado" : "Configuração pendente"}
            </Badge>
            <Badge variant="info">{googleWorkspace.totalEventosBase} eventos na base demo</Badge>
            <Badge variant="info">
              {googleWorkspace.totalPlanilhasVinculadas} planilha(s) vinculada(s)
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/80 p-4">
              <p className="text-sm text-muted-foreground">URL do Web App</p>
              <p className="mt-2 break-words font-medium">
                {googleWorkspace.webAppUrl || "Não configurado"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 p-4">
              <p className="text-sm text-muted-foreground">Segredo compartilhado</p>
              <p className="mt-2 break-words font-medium">
                {googleWorkspace.sharedSecretConfigured ? "Configurado" : "Opcional / não configurado"}
              </p>
            </div>
          </div>

          {!googleWorkspace.configured ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-4">
              <p className="font-medium">Faltando variáveis</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {googleWorkspace.missing.join(", ")}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 p-4">
              <p className="font-medium">Pronto para criar planilhas</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cada evento já pode criar ou sincronizar sua própria planilha via Apps Script, com reaproveitamento do vínculo existente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passos de implantação</CardTitle>
          <CardDescription>Checklist técnico para concluir a integração real com serviços Google.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "Colar o conteúdo do Código.gs no projeto do Apps Script",
            "Definir a Script Property DRIVE_FOLDER_ID com a pasta de destino",
            "Publicar o Apps Script como Web App com acesso autorizado",
            "Preencher GOOGLE_APPS_SCRIPT_WEB_APP_URL e, se desejar, GOOGLE_APPS_SCRIPT_SHARED_SECRET"
          ].map((step) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-border/80 p-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="font-medium">{step}</p>
            </div>
          ))}

          <div className="flex flex-wrap gap-3 pt-2">
            <Badge variant="info">OAuth 2.0</Badge>
            <Badge variant="info">Apps Script Web App</Badge>
            <Badge variant="warning">Sync bidirecional</Badge>
            <Badge variant="success">Evitar duplicidade por ID</Badge>
          </div>

          <Button className="mt-2" variant="outline">Revisar configuração</Button>
        </CardContent>
      </Card>
    </div>
  );
}
