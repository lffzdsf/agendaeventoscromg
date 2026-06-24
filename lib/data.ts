export type EventStatus =
  | "Ideia"
  | "Em planejamento"
  | "Programação em montagem"
  | "Divulgação em andamento"
  | "Inscrições abertas"
  | "Em execução"
  | "Concluído"
  | "Cancelado";

export type TaskStatus =
  | "A fazer"
  | "Em andamento"
  | "Aguardando retorno"
  | "Em aprovação"
  | "Concluído"
  | "Atrasado";

export type EventItem = {
  id: string;
  name: string;
  type: string;
  city: string;
  location: string;
  address: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  audience: string;
  description: string;
  owner: string;
  status: EventStatus;
  priority: "Alta" | "Média" | "Baixa";
  pageUrl?: string;
  registrationUrl?: string;
  driveUrl?: string;
  notes: string;
};

export type TaskItem = {
  id: string;
  title: string;
  eventId: string;
  category: string;
  owner: string;
  dueDate: string;
  priority: "Alta" | "Média" | "Baixa";
  status: TaskStatus;
};

export type SpeakerItem = {
  id: string;
  name: string;
  registration: string;
  phone: string;
  email: string;
  city: string;
  bio: string;
  alignmentStatus: string;
  driveUrl?: string;
};

export type ProgramItem = {
  id: string;
  eventId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  title: string;
  activityType: string;
  speakerName: string;
  speakerRegistration: string;
  contact: string;
  notes: string;
  photoUrl?: string;
  driveUrl?: string;
  cardName?: string;
  caption?: string;
};

export const events: EventItem[] = [
  {
    id: "simposio-bh-2026",
    name: "Simpósio Mineiro de Odontologia Digital",
    type: "Simpósio",
    city: "Belo Horizonte",
    location: "Auditório CRO-MG",
    address: "Av. do Contorno, 5200",
    startDate: "2026-07-12",
    endDate: "2026-07-12",
    startTime: "08:30",
    endTime: "18:00",
    audience: "Cirurgiões-dentistas e estudantes",
    description: "Encontro técnico com palestras sobre fluxo digital, radiologia e gestão clínica.",
    owner: "Marina Oliveira",
    status: "Divulgação em andamento",
    priority: "Alta",
    pageUrl: "https://cro-mg.example/simposio-digital",
    registrationUrl: "https://even3.com.br/simposio-digital",
    driveUrl: "https://drive.google.com/drive/folders/simposio-digital",
    notes: "Aguardando aprovação final do card principal."
  },
  {
    id: "webinar-eticia-2026",
    name: "Webinar Ética e Prontuário",
    type: "Webinar",
    city: "Online",
    location: "YouTube CRO-MG",
    address: "Transmissão remota",
    startDate: "2026-07-03",
    endDate: "2026-07-03",
    startTime: "19:30",
    endTime: "21:00",
    audience: "Profissionais inscritos",
    description: "Debate sobre prontuário, consentimento e guarda documental.",
    owner: "Carlos Mendes",
    status: "Inscrições abertas",
    priority: "Média",
    pageUrl: "https://cro-mg.example/webinar-etica",
    registrationUrl: "https://even3.com.br/webinar-etica",
    driveUrl: "https://drive.google.com/drive/folders/webinar-etica",
    notes: "Página publicada e automação de e-mail aprovada."
  },
  {
    id: "capacitacao-juiz-fora",
    name: "Capacitação de Fiscalização Regional",
    type: "Capacitação",
    city: "Juiz de Fora",
    location: "Hotel Serrano",
    address: "Rua Halfeld, 210",
    startDate: "2026-08-09",
    endDate: "2026-08-10",
    startTime: "09:00",
    endTime: "17:00",
    audience: "Delegados e fiscais",
    description: "Capacitação operacional com trilha de procedimentos e comunicação institucional.",
    owner: "Fernanda Souza",
    status: "Programação em montagem",
    priority: "Alta",
    driveUrl: "https://drive.google.com/drive/folders/capacitacao-fiscalizacao",
    notes: "Definir fornecedores de coffee break e registro fotográfico."
  }
];

export const tasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Aprovar arte do card principal",
    eventId: "simposio-bh-2026",
    category: "Cards",
    owner: "Equipe Comunicação",
    dueDate: "2026-06-28",
    priority: "Alta",
    status: "Em aprovação"
  },
  {
    id: "task-2",
    title: "Subir landing page no Even3",
    eventId: "capacitacao-juiz-fora",
    category: "Página do evento",
    owner: "Lucas Prado",
    dueDate: "2026-06-26",
    priority: "Alta",
    status: "Atrasado"
  },
  {
    id: "task-3",
    title: "Coletar mini currículo do palestrante",
    eventId: "webinar-eticia-2026",
    category: "Alinhamento com palestrantes",
    owner: "Marina Oliveira",
    dueDate: "2026-06-29",
    priority: "Média",
    status: "Em andamento"
  },
  {
    id: "task-4",
    title: "Confirmar transmissão e vinheta",
    eventId: "webinar-eticia-2026",
    category: "Transmissão",
    owner: "Audiovisual",
    dueDate: "2026-06-27",
    priority: "Média",
    status: "A fazer"
  }
];

export const speakers: SpeakerItem[] = [
  {
    id: "sp-1",
    name: "Dra. Renata Assis",
    registration: "CRO-MG 23891",
    phone: "(31) 99999-1001",
    email: "renata.assis@example.com",
    city: "Belo Horizonte",
    bio: "Especialista em odontologia digital e fluxos CAD/CAM.",
    alignmentStatus: "Card aprovado",
    driveUrl: "https://drive.google.com/drive/folders/renata-assis"
  },
  {
    id: "sp-2",
    name: "Dr. Paulo Freire",
    registration: "CRO-MG 18420",
    phone: "(32) 99999-2200",
    email: "paulo.freire@example.com",
    city: "Juiz de Fora",
    bio: "Atua em ética profissional, prontuário e responsabilidade técnica.",
    alignmentStatus: "Dados recebidos",
    driveUrl: "https://drive.google.com/drive/folders/paulo-freire"
  }
];

export const program: ProgramItem[] = [
  {
    id: "pg-1",
    eventId: "simposio-bh-2026",
    date: "2026-07-12",
    startTime: "09:00",
    endTime: "10:00",
    room: "Auditório Principal",
    title: "Panorama da odontologia digital",
    activityType: "Palestra",
    speakerName: "Dra. Renata Assis",
    speakerRegistration: "CRO-MG 23891",
    contact: "renata.assis@example.com",
    notes: "Solicitar apresentação até 07/07.",
    cardName: "card-renata-odontologia-digital",
    caption: "A inovação clínica começa pelo planejamento digital."
  },
  {
    id: "pg-2",
    eventId: "webinar-eticia-2026",
    date: "2026-07-03",
    startTime: "19:30",
    endTime: "20:30",
    room: "Estúdio Transmissão",
    title: "Prontuário e segurança jurídica",
    activityType: "Webinar",
    speakerName: "Dr. Paulo Freire",
    speakerRegistration: "CRO-MG 18420",
    contact: "paulo.freire@example.com",
    notes: "Inserir lembrete de envio de certificado."
  }
];

export const vendors = [
  {
    name: "Studio Frame",
    category: "Cobertura audiovisual",
    status: "Orçamento recebido",
    contact: "contato@studioframe.com.br"
  },
  {
    name: "Café Minas Eventos",
    category: "Coffee break",
    status: "Em negociação",
    contact: "(31) 98888-4433"
  }
];

export const communicationChecklist = [
  { label: "Página do evento", status: "Concluído" },
  { label: "Cards de divulgação", status: "Em aprovação" },
  { label: "Cards individuais", status: "Em produção" },
  { label: "Legendas para redes sociais", status: "Rascunho pronto" },
  { label: "Stories", status: "Não iniciado" },
  { label: "E-mail marketing", status: "Aguardando segmentação" }
];

export const stats = {
  totalEvents: events.length,
  monthEvents: 2,
  upcomingEvents: 3,
  delayedTasks: tasks.filter((task) => task.status === "Atrasado").length,
  inProgressTasks: tasks.filter((task) => task.status === "Em andamento").length,
  noPageEvents: events.filter((event) => !event.pageUrl).length,
  noCommunicationEvents: 1,
  incompleteProgram: 1
};

export function getEventById(id: string) {
  return events.find((event) => event.id === id);
}

export function getTasksByEvent(id: string) {
  return tasks.filter((task) => task.eventId === id);
}

export function getProgramByEvent(id: string) {
  return program.filter((item) => item.eventId === id);
}
