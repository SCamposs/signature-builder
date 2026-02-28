"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Maximize, FlaskConical, Zap } from "lucide-react";
import type { SignatureData } from "@/types/signature";
import { buildSignatureHTML } from "@/lib/signature-builder";
import { InstallGuide } from "@/components/signature/InstallGuide";

interface SignaturePreviewProps {
  data: SignatureData | null;
  isLive?: boolean;
}

const EXAMPLE_DATA: SignatureData = {
  template: "standard",
  name: "Maria da Silva",
  role: "Coordenadora Pedagógica",
  department: "Ensino Médio",
  phone: "(24) 3355-1389",
  email: "maria.silva@salesiano.br",
  facebookUrl: "",
  instagramUrl: "https://instagram.com/salesianoresende",
  linkedinUrl: "",
};

export function SignaturePreview({
  data,
  isLive = false,
}: SignaturePreviewProps) {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isExample = data === null;
  const displayData = data ?? EXAMPLE_DATA;

  // Preencher iframe com o HTML da assinatura (real ou exemplo)
  useEffect(() => {
    if (!iframeRef.current) return;
    const html = buildSignatureHTML(displayData);
    const iframeDoc =
      iframeRef.current.contentDocument ||
      iframeRef.current.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, Helvetica, sans-serif; padding: 10px; margin: 0; background: #fff; }
  </style>
</head>
<body>
${html}
</body>
</html>`);
      iframeDoc.close();
    }
  }, [displayData]);

  const html = buildSignatureHTML(displayData);

  async function handleCopy() {
    try {
      console.log("Tentando copiar HTML:", html.substring(0, 200));

      // Copia como HTML rico (preserva formatação ao colar em clientes de email)
      const blob = new Blob([html], { type: "text/html" });
      const plainBlob = new Blob([html], { type: "text/plain" });

      const clipboardItem = new ClipboardItem({
        "text/html": blob,
        "text/plain": plainBlob,
      });

      await navigator.clipboard.write([clipboardItem]);
      console.log("✓ HTML copiado com sucesso!");
    } catch (err) {
      console.warn("Clipboard API falhou, tentando fallback:", err);
      // Fallback: copia texto puro (menos ideal, mas funciona em todos os browsers)
      try {
        await navigator.clipboard.writeText(html);
        console.log("✓ Texto copiado (fallback)");
      } catch (fallbackErr) {
        console.error("Erro ao copiar:", fallbackErr);
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function handleFullscreen() {
    const previewWindow = window.open("", "_blank", "width=800,height=600");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Preview - Assinatura Email</title>
            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                padding: 20px;
                background: #f5f5f5;
              }
            </style>
          </head>
          <body>
            ${html}
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Badge de exemplo */}
      {isExample && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <FlaskConical className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Exemplo com dados fictícios.</strong> Preencha o formulário
            e clique em <strong>Gerar assinatura</strong> para ver a sua.
          </span>
        </div>
      )}

      {/* Badge de live preview */}
      {isLive && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <Zap className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>Preview ao vivo.</strong> Clique em{" "}
            <strong>Gerar assinatura</strong> para confirmar e habilitar a
            cópia.
          </span>
        </div>
      )}

      {/* Área de preview */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          {isExample
            ? "Exemplo de assinatura"
            : isLive
              ? "Preview ao vivo"
              : "Preview da assinatura"}
        </p>
        {/* iFrame para renderizar exatamente como será copiado */}
        <iframe
          ref={iframeRef}
          title="preview"
          className="w-full border-0"
          style={{ minHeight: "300px" }}
        />
      </div>

      {/* Botões de ação — só aparecem com assinatura confirmada (não live, não exemplo) */}
      {!isExample && !isLive && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {/* Botão copiar */}
            <Button
              onClick={handleCopy}
              className="gap-2 font-semibold transition-colors cursor-pointer text-white hover:text-white"
              style={
                copied
                  ? { backgroundColor: "#16a34a" }
                  : { backgroundColor: "#E4002B" }
              }
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </Button>

            {/* Botão fullscreen */}
            <Button
              onClick={handleFullscreen}
              className="gap-2 font-semibold bg-blue-900 hover:bg-blue-800 cursor-pointer text-white hover:text-white"
              variant="outline"
            >
              <Maximize className="h-4 w-4" />
              Abrir
            </Button>
          </div>

          {/* Dica de uso */}
          <p className="text-center text-xs text-slate-400">
            Cole diretamente no campo de assinatura do Gmail, Outlook ou
            Thunderbird.
          </p>

          {/* Guia de instalação */}
          <InstallGuide data={displayData} />
        </>
      )}
    </div>
  );
}
