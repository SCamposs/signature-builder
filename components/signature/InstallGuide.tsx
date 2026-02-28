"use client";

import { Printer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { SignatureData } from "@/types/signature";
import { buildSignatureHTML } from "@/lib/signature-builder";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  text: string;
  note?: string;
}

interface Client {
  id: string;
  label: string;
  steps: (name: string) => Step[];
}

// ─── Guias por cliente ────────────────────────────────────────────────────────

const CLIENTS: Client[] = [
  {
    id: "gmail",
    label: "Gmail",
    steps: (name) => [
      { text: "Clique no ícone de engrenagem ⚙️ no canto superior direito." },
      { text: 'Selecione "Ver todas as configurações".' },
      {
        text: 'Na aba "Geral", role a página até encontrar a seção "Assinatura".',
      },
      { text: 'Clique em "Criar nova".' },
      { text: `Dê um nome à assinatura, por exemplo: "${name}".` },
      {
        text: 'Na área de texto da assinatura, clique com o botão direito e selecione "Colar" — ou use Ctrl+V.',
        note: 'Certifique-se de copiar usando o botão "Copiar" no gerador, não Ctrl+C no código HTML.',
      },
      {
        text: 'Em "Padrões de assinatura", defina a nova assinatura como padrão para novos e-mails e para respostas.',
      },
      { text: 'Role até o final da página e clique em "Salvar alterações".' },
    ],
  },
  {
    id: "outlook-app",
    label: "Outlook (Desktop)",
    steps: (name) => [
      { text: 'Abra o Outlook e clique em "Arquivo" no menu superior.' },
      { text: 'Selecione "Opções".' },
      { text: 'Clique em "Email" no painel esquerdo.' },
      { text: 'Clique no botão "Assinaturas…".' },
      { text: 'Clique em "Nova" para criar uma assinatura.' },
      { text: `Nomeie a assinatura como "${name}".` },
      {
        text: "Na área de edição da assinatura, cole com Ctrl+V.",
        note: 'O Outlook preserva a formatação HTML ao colar. Não cole dentro do campo "Texto simples".',
      },
      {
        text: 'Em "Escolher assinatura padrão", selecione a nova assinatura para "Novas mensagens" e "Respostas/encaminhamentos".',
      },
      { text: 'Clique em "OK" para salvar.' },
    ],
  },
  {
    id: "outlook-web",
    label: "Outlook (Web)",
    steps: (name) => [
      { text: "Acesse outlook.office.com e faça login." },
      { text: "Clique no ícone de engrenagem ⚙️ no canto superior direito." },
      { text: 'Vá em "Conta" → "Assinaturas".' },
      {
        text: 'Na seção "Assinaturas", clique em "Nova assinatura".',
        note: "Se já houver uma assinatura, você pode editá-la diretamente.",
      },
      { text: `Dê o nome "${name}" para identificar.` },
      {
        text: "Na caixa de edição, clique com o botão direito e cole (Ctrl+V).",
      },
      {
        text: "Ative as opções para usar como padrão em novos e-mails e respostas.",
      },
      { text: 'Clique em "Salvar" no canto superior direito.' },
    ],
  },
  {
    id: "apple-mail",
    label: "Apple Mail",
    steps: (name) => [
      { text: "Abra o aplicativo Mail no macOS." },
      {
        text: 'No menu superior, clique em "Mail" → "Configurações" (ou "Preferências" em versões mais antigas).',
      },
      { text: 'Clique na aba "Assinaturas".' },
      { text: "No painel esquerdo, selecione a conta de e-mail desejada." },
      { text: 'Clique no botão "+" para criar uma nova assinatura.' },
      { text: `Renomeie para "${name}".` },
      {
        text: "No painel direito (área de edição), cole com Cmd+V.",
        note: 'Desmarque a opção "Sempre manter correspondência com a fonte padrão de mensagem" para preservar a formatação.',
      },
      {
        text: "Arraste a assinatura para a conta de e-mail correta no painel esquerdo (se necessário).",
      },
      {
        text: "Feche as configurações. A assinatura já estará disponível ao compor novos e-mails.",
      },
    ],
  },
  {
    id: "thunderbird",
    label: "Thunderbird",
    steps: (name) => [
      {
        text: 'Abra o Thunderbird e clique em "Ferramentas" → "Configurações da conta".',
      },
      {
        text: "No painel esquerdo, localize sua conta de e-mail e clique nela.",
      },
      { text: 'Marque a opção "Usar HTML" na seção de assinatura.' },
      {
        text: "Cole o código HTML da assinatura na caixa de texto.",
        note: 'Para obter o HTML, no gerador clique com o botão direito no botão "Copiar" e use a opção de copiar código-fonte, ou peça ao suporte técnico.',
      },
      { text: 'Clique em "OK" para salvar.' },
      {
        text: `Ao compor um novo e-mail, a assinatura de ${name || "sua conta"} aparecerá automaticamente.`,
      },
    ],
  },
];

// ─── Print helper ─────────────────────────────────────────────────────────────

function printGuide(data: SignatureData, clientId: string) {
  const signatureHtml = buildSignatureHTML(data);
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const steps = client.steps(data.name || "Sua assinatura");

  const stepsHtml = steps
    .map(
      (s, i) => `
      <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start;">
        <span style="flex-shrink:0;width:24px;height:24px;border-radius:50%;background:#003087;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
        <div>
          <p style="margin:0;font-size:13px;color:#1e293b;">${s.text}</p>
          ${s.note ? `<p style="margin:4px 0 0;font-size:11px;color:#64748b;font-style:italic;">${s.note}</p>` : ""}
        </div>
      </div>`,
    )
    .join("");

  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Guia de Instalação — Assinatura de E-mail</title>
  <style>
    @media print { .no-print { display: none !important; } }
    body { font-family: Arial, Helvetica, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1 { font-size: 18px; color: #003087; margin-bottom: 4px; }
    h2 { font-size: 14px; color: #475569; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 28px 0 14px; }
    .badge { display: inline-block; background: #e8f0ff; color: #003087; border-radius: 4px; font-size: 11px; font-weight: 700; padding: 2px 8px; margin-bottom: 20px; }
    .note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 0 4px 4px 0; font-size: 12px; color: #92400e; margin-top: 6px; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .print-btn { display: block; margin: 0 0 24px; }
  </style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()" style="background:#003087;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">🖨️ Imprimir este guia</button>
  <h1>Guia de Instalação — Assinatura de E-mail</h1>
  <span class="badge">Instituto São José Salesiano · Resende</span>

  <h2>Sua assinatura</h2>
  ${signatureHtml}

  <h2>Como instalar no ${client.label}</h2>
  ${stepsHtml}

  <h2>Observações técnicas</h2>
  <ul style="font-size:13px;color:#475569;line-height:1.7;padding-left:18px;">
    <li>A assinatura foi gerada em HTML compatível com <strong>Outlook, Gmail e Apple Mail</strong>.</li>
    <li>Sempre use o botão <strong>"Copiar"</strong> do gerador antes de colar no cliente de e-mail.</li>
    <li>Não edite a assinatura diretamente no cliente de e-mail para evitar quebra de layout.</li>
    <li>Se precisar de atualização, acesse o gerador novamente e gere uma nova versão.</li>
  </ul>

  <div class="footer">
    Gerado em ${new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })} · signature-salesiano.vercel.app
  </div>
</body>
</html>`);
  win.document.close();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface InstallGuideProps {
  data: SignatureData;
}

export function InstallGuide({ data }: InstallGuideProps) {
  const firstName = data.name.trim().split(" ")[0] || "colaborador(a)";

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Guia de instalação
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Passo a passo para instalar sua assinatura no cliente de e-mail
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-4">
        <Tabs defaultValue="gmail">
          <TabsList className="mb-4 flex h-auto flex-wrap gap-1 bg-transparent p-0">
            {CLIENTS.map((c) => (
              <TabsTrigger
                key={c.id}
                value={c.id}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:border-blue-900"
              >
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CLIENTS.map((client) => {
            const steps = client.steps(data.name || "sua assinatura");
            return (
              <TabsContent key={client.id} value={client.id} className="mt-0">
                <ol className="space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: "#003087" }}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-700 leading-snug">
                          {step.text}
                        </p>
                        {step.note && (
                          <p className="mt-1 text-[11px] text-amber-700 bg-amber-50 border-l-2 border-amber-300 pl-2 py-0.5 rounded-r">
                            {step.note}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Print button per client */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-2 text-xs"
                  onClick={() => printGuide(data, client.id)}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Imprimir guia para {client.label}
                </Button>

                <p className="mt-3 text-[11px] text-slate-400">
                  Olá, {firstName}! Após instalar, envie um e-mail de teste para
                  confirmar que a assinatura aparece corretamente.
                </p>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
