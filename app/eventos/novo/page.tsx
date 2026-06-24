import { EventForm } from "@/components/events/event-form";
import { PageHeader } from "@/components/layout/page-header";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cadastro"
        title="Novo evento"
        description="Formulário base com os campos principais do processo atual do CRO-MG."
      />
      <EventForm mode="create" />
    </div>
  );
}
