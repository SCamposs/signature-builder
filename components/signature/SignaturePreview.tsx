"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Maximize } from "lucide-react";
import type { SignatureData } from "@/types/signature";
import { buildSignatureHTML } from "@/lib/signature-builder";

interface SignaturePreviewProps {
  data: SignatureData | null;
}

export function SignaturePreview({ data }: SignaturePreviewProps) {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Preencher iframe com o HTML da assinatura
  useEffect(() => {
    if (data && iframeRef.current) {
      const html = buildSignatureHTML(data);
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
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: "#003087" + "1A" }}
        >
          <Maximize className="h-5 w-5" style={{ color: "#003087" }} />
        </div>
        <p className="text-sm font-medium text-slate-600">
          Preencha o formulário e clique em{" "}
          <span className="font-semibold" style={{ color: "#003087" }}>
            Gerar assinatura
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          O preview aparece aqui após gerar.
        </p>
      </div>
    );
  }

  const html = buildSignatureHTML(data);

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
      {/* Área de preview */}
      <div className="max-h-125 overflow-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          Preview da assinatura
        </p>
        {/* iFrame para renderizar exatamente como será copiado */}
        <iframe
          ref={iframeRef}
          title="preview"
          className="w-full border-0"
          style={{ minHeight: "300px" }}
        />
      </div>

      {/* Botões de ação */}
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
    </div>
  );
}
