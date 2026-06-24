"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EventItem } from "@/lib/data";

type EventFormProps = {
  initialData?: EventItem | null;
  mode: "create" | "edit";
};

const eventTypes = [
  "Congresso",
  "Simpósio",
  "Webinar",
  "Palestra",
  "Ação institucional",
  "Reunião",
  "Capacitação",
  "Evento externo",
  "Outro"
];

const eventStatuses = [
  "Ideia",
  "Em planejamento",
  "Programação em montagem",
  "Divulgação em andamento",
  "Inscrições abertas",
  "Em execução",
  "Concluído",
  "Cancelado"
];

const priorities = ["Alta", "Média", "Baixa"];

function Field({
  label,
  children,
  className
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <span className="block text-sm font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function toFormData(initialData?: EventItem | null) {
  return {
    id: initialData?.id ?? "",
    name: initialData?.name ?? "",
    type: initialData?.type ?? "Simpósio",
    city: initialData?.city ?? "",
    location: initialData?.location ?? "",
    address: initialData?.address ?? "",
    startDate: initialData?.startDate ?? "",
    endDate: initialData?.endDate ?? "",
    startTime: initialData?.startTime ?? "",
    endTime: initialData?.endTime ?? "",
    audience: initialData?.audience ?? "",
    description: initialData?.description ?? "",
    owner: initialData?.owner ?? "",
    status: initialData?.status ?? "Em planejamento",
    priority: initialData?.priority ?? "Média",
    pageUrl: initialData?.pageUrl ?? "",
    registrationUrl: initialData?.registrationUrl ?? "",
    driveUrl: initialData?.driveUrl ?? "",
    notes: initialData?.notes ?? ""
  };
}

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState(() => toFormData(initialData));
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function updateField(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(
        mode === "edit" ? `/api/events/${formData.id}` : "/api/events",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await readJsonSafely<{ error?: string; event?: EventItem }>(response);

      if (!response.ok || !data?.event) {
        throw new Error(
          data?.error ??
            "Não foi possível salvar o evento. Verifique se o backend publicado está respondendo corretamente."
        );
      }

      router.push(`/events/${data.event.id}`);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Ocorreu um erro ao salvar o evento."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "edit" ? "Editar evento" : "Dados principais"}</CardTitle>
        <CardDescription>
          Atualize os campos do evento e salve para refletir as mudanças na visualização e na sincronização.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Nome do evento">
            <Input name="name" placeholder="Nome do evento" value={formData.name} onChange={updateField} required />
          </Field>
          <Field label="Tipo de evento">
            <Select name="type" value={formData.type} onChange={updateField}>
              {eventTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </Field>
          <Field label="Cidade">
            <Input name="city" placeholder="Cidade" value={formData.city} onChange={updateField} required />
          </Field>
          <Field label="Local">
            <Input name="location" placeholder="Local" value={formData.location} onChange={updateField} required />
          </Field>
          <Field label="Endereço">
            <Input name="address" placeholder="Endereço" value={formData.address} onChange={updateField} required />
          </Field>
          <Field label="Público-alvo">
            <Input name="audience" placeholder="Público-alvo" value={formData.audience} onChange={updateField} required />
          </Field>
          <Field label="Data de início">
            <Input name="startDate" type="date" value={formData.startDate} onChange={updateField} required />
          </Field>
          <Field label="Data de fim">
            <Input name="endDate" type="date" value={formData.endDate} onChange={updateField} required />
          </Field>
          <Field label="Horário de início">
            <Input name="startTime" type="time" value={formData.startTime} onChange={updateField} required />
          </Field>
          <Field label="Horário de fim">
            <Input name="endTime" type="time" value={formData.endTime} onChange={updateField} required />
          </Field>
          <Field label="Responsável interno">
            <Input name="owner" placeholder="Responsável interno" value={formData.owner} onChange={updateField} required />
          </Field>
          <Field label="Status">
            <Select name="status" value={formData.status} onChange={updateField}>
              {eventStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Select>
          </Field>
          <Field label="Prioridade">
            <Select name="priority" value={formData.priority} onChange={updateField}>
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </Select>
          </Field>
          <Field label="Link da página do evento">
            <Input name="pageUrl" placeholder="Link da página do evento" value={formData.pageUrl} onChange={updateField} />
          </Field>
          <Field label="Link de inscrição">
            <Input name="registrationUrl" placeholder="Link de inscrição" value={formData.registrationUrl} onChange={updateField} />
          </Field>
          <Field label="Link da pasta no Google Drive">
            <Input name="driveUrl" placeholder="Link da pasta no Google Drive" value={formData.driveUrl} onChange={updateField} />
          </Field>
          <Field label="Descrição" className="md:col-span-2">
            <Textarea name="description" placeholder="Descrição" value={formData.description} onChange={updateField} />
          </Field>
          <Field label="Observações internas" className="md:col-span-2">
            <Textarea name="notes" placeholder="Observações internas" value={formData.notes} onChange={updateField} />
          </Field>
          {error ? <p className="md:col-span-2 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : mode === "edit" ? "Salvar alterações" : "Salvar evento"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
