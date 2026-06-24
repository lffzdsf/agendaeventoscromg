import Link from "next/link";
import type { Session } from "next-auth";
import {
  ClipboardList,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Mic2,
  Package2,
  Settings2,
  Users2
} from "lucide-react";

import { signOut } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Eventos", icon: ClipboardList },
  { href: "/tasks", label: "Kanban", icon: KanbanSquare },
  { href: "/speakers", label: "Palestrantes", icon: Mic2 },
  { href: "/vendors", label: "Fornecedores", icon: Package2 },
  { href: "/communication", label: "Comunicação", icon: Megaphone },
  { href: "/settings", label: "Integrações", icon: Settings2 }
];

export function AppShell({
  children,
  pathname,
  session
}: {
  children: React.ReactNode;
  pathname: string;
  session: Session | null;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1880px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border bg-card/95 p-6 shadow-panel backdrop-blur lg:flex lg:flex-col">
          <div className="mb-8">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Agenda CRO-MG</h1>
            <p className="text-sm text-muted-foreground">Gestão institucional de eventos</p>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-secondary p-4">
            <p className="text-sm font-semibold">Google Workspace pronto para integrar</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A estrutura já separa eventos, programação, tarefas e sincronização futura com Calendar e Sheets.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col gap-6">
          <header className="rounded-[28px] border bg-card/90 p-4 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-primary">CRO-MG</p>
                <h2 className="text-2xl font-bold">Gestão da agenda de eventos</h2>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  className="w-full md:w-72"
                  placeholder="Buscar evento, palestrante ou tarefa"
                />
                <div className="hidden rounded-2xl border border-border/70 bg-secondary/60 px-4 py-2 text-right md:block">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Acesso
                  </p>
                  <p className="max-w-56 truncate text-sm font-medium">
                    {session?.user?.email ?? "Conta interna"}
                  </p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/70 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                    aria-label="Sair da plataforma"
                  >
                    <LogOut className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Sair</span>
                  </button>
                </form>
                <ThemeToggle />
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
