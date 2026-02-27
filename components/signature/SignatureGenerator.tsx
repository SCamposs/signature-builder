"use client";

import { useState } from "react";
import { SignatureForm } from "@/components/signature/SignatureForm";
import { SignaturePreview } from "@/components/signature/SignaturePreview";
import type { SignatureData } from "@/types/signature";
import { Card } from "../ui/card";

export function SignatureGenerator() {
  const [signatureData, setSignatureData] = useState<SignatureData | null>(
    null,
  );

  return (
    <div className="mx-auto max-w-7xl">
      {/* Subtítulo */}
      <p className="mb-5 text-sm text-slate-500">
        Preencha seus dados abaixo para gerar uma assinatura padronizada.
        <br className="hidden sm:block" />
        Após gerar, copie e cole diretamente nas configurações do seu cliente de
        e-mail.
      </p>

      {/* Layout duas colunas */}
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        {/* Painel formulário */}
        <Card className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Seus dados
          </h2>
          <SignatureForm onGenerate={setSignatureData} />
        </Card>

        {/* Painel preview */}
        <Card className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Preview &amp; Cópia
          </h2>
          <SignaturePreview data={signatureData} />
        </Card>
      </div>

      {/* Dica instrucional */}
      <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
        <span className="font-semibold">Dica:</span> Para usar no Gmail, acesse{" "}
        <code className="inline-block break-all rounded bg-blue-100 px-1 py-0.5">
          Configurações → Ver todas as configurações → Aba &quot;Geral&quot; →
          Assinatura
        </code>
        . No Outlook:{" "}
        <code className="inline-block break-all rounded bg-blue-100 px-1 py-0.5">
          Arquivo → Opções → Email → Assinaturas
        </code>
        .
      </div>
    </div>
  );
}
