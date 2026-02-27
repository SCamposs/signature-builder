import Image from "next/image";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header institucional */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:gap-4 sm:px-6">
        <Image
          src="/assets/logo-arco-s.png"
          alt="S Salesiano"
          width={32}
          height={32}
          className="shrink-0 sm:w-9 sm:h-9"
          priority
        />
        <div className="min-w-0">
          <p
            className="truncate text-xs font-medium uppercase tracking-widest sm:text-sm"
            style={{ color: "#003087" }}
          >
            Instituto São José Salesiano · Resende
          </p>
          <h1
            className="text-sm font-bold leading-tight sm:text-base"
            style={{ color: "#003087" }}
          >
            Gerador de Assinatura de E-mail
          </h1>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 text-center text-xs text-slate-400">
        Instituto São José Salesiano – Resende &copy; {new Date().getFullYear()}{" "}
        - desenvolvido por <strong>Ítalo Soares Campos</strong>
      </footer>
    </div>
  );
}
