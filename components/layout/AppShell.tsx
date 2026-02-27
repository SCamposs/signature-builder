import Image from "next/image";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header institucional */}
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <Image
          src="/assets/logo-arco-s.png"
          alt="S Salesiano"
          width={36}
          height={36}
          className="shrink-0"
          priority
        />
        <div>
          <p
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color: "#003087" }}
          >
            Instituto São José Salesiano · Resende
          </p>
          <h1
            className="text-base font-bold leading-tight"
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
        - desenvolvido por Ítalo Soares Campos
      </footer>
    </div>
  );
}
