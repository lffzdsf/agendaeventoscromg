import { notFound } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { PageHeader } from "@/components/layout/page-header";
import { getStoredEventById } from "@/lib/events-store";

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getStoredEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Edição"
        title={`Editar ${event.name}`}
        description="Atualize os dados do evento e salve para refletir as mudanças no app e na sincronização."
      />
      <EventForm initialData={event} mode="edit" />
    </div>
  );
}
