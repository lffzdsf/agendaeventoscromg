import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  const isGoogleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-[32px] border bg-card/95 p-8 shadow-panel backdrop-blur">
        <p className="text-sm uppercase tracking-[0.22em] text-primary">CRO-MG</p>
        <h1 className="mt-3 text-3xl font-bold">Acesso restrito a contas internas</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Entre com sua conta Google institucional `@cromg.org.br` para acessar a plataforma de
          gestão da agenda de eventos.
        </p>

        <div className="mt-8 rounded-3xl border border-border/70 bg-secondary/60 p-5">
          <p className="text-sm font-semibold">Política de acesso</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Apenas usuários autenticados com e-mail corporativo do domínio `cromg.org.br` podem
            visualizar ou editar os dados dos eventos.
          </p>
        </div>

        {isGoogleConfigured ? (
          <form
            className="mt-8"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              Entrar com Google Workspace
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            Configure `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` e `AUTH_SECRET` no ambiente para
            habilitar o login corporativo.
          </div>
        )}
      </section>
    </div>
  );
}
