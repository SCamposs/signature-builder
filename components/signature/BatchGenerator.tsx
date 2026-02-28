"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  Loader2,
  PackageCheck,
  TableProperties,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildSignatureHTML } from "@/lib/signature-builder";
import { emptySignature, type SignatureData } from "@/types/signature";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CsvRow {
  index: number;
  raw: string;
  data: SignatureData;
  errors: string[];
}

interface BatchReport {
  generated: number;
  ignored: CsvRow[];
  zipFilename: string;
}

// ─── CSV template ─────────────────────────────────────────────────────────────

const CSV_HEADER = "nome,cargo,setor,telefone,email,template";
const CSV_EXAMPLE = `${CSV_HEADER}
Maria da Silva,Coordenadora Pedagógica,Ensino Médio,(24) 3355-1389,maria.silva@salesiano.br,standard
João Santos,Professor,Ensino Fundamental,(24) 3355-0000,joao.santos@salesiano.br,standard
Ana Lima,Secretária,Coordenação,(24) 3355-1390,ana.lima@salesiano.br,compact`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsv(raw: string): CsvRow[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Skip header if present
  const dataLines = lines.filter((l) => !l.toLowerCase().startsWith("nome,"));

  return dataLines.map((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const [
      name = "",
      role = "",
      department = "",
      phone = "",
      email = "",
      tpl = "",
    ] = cols;

    const errors: string[] = [];
    if (!name) errors.push("Nome obrigatório");
    if (!role) errors.push("Cargo obrigatório");
    if (!email) errors.push("E-mail obrigatório");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push("E-mail inválido");

    const data: SignatureData = {
      ...emptySignature,
      name,
      role,
      department,
      phone,
      email,
      template: tpl === "compact" ? "compact" : "standard",
    };

    return { index: i + 1, raw: line, data, errors };
  });
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assinatura de E-mail</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; padding: 20px; margin: 0; background: #fff; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BatchGenerator() {
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [previewRow, setPreviewRow] = useState<CsvRow | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [report, setReport] = useState<BatchReport | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRows = rows.filter((r) => r.errors.length === 0);
  const invalidRows = rows.filter((r) => r.errors.length > 0);
  const hasParsed = rows.length > 0;

  function handleCsvChange(text: string) {
    setCsvText(text);
    setReport(null);
    if (!text.trim()) {
      setRows([]);
      setPreviewRow(null);
      return;
    }
    const parsed = parseCsv(text);
    setRows(parsed);
    setPreviewRow(null);
  }

  function handlePreview(row: CsvRow) {
    setPreviewRow(row);
    setTimeout(() => {
      if (!iframeRef.current) return;
      const html = buildSignatureHTML(row.data);
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(wrapHtml(html));
        doc.close();
      }
    }, 0);
  }

  function handleDownloadTemplate() {
    downloadFile(
      "modelo-assinaturas.csv",
      CSV_EXAMPLE,
      "text/csv;charset=utf-8",
    );
  }

  async function handleDownloadZip() {
    if (!validRows.length) return;
    setDownloading(true);
    setDownloadedCount(0);
    setReport(null);

    const zip = new JSZip();
    const date = new Date().toISOString().slice(0, 10);
    const folder = zip.folder(`assinaturas-${date}`)!;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const html = buildSignatureHTML(row.data);
      const filename = `${slugify(row.data.name) || `colaborador-${row.index}`}.html`;
      folder.file(filename, wrapHtml(html));
      setDownloadedCount(i + 1);
      // yield to React so progress updates render
      await new Promise((r) => setTimeout(r, 0));
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFilename = `assinaturas-${date}.zip`;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloading(false);
    setReport({
      generated: validRows.length,
      ignored: invalidRows,
      zipFilename,
    });
  }

  function handleLoadExample() {
    handleCsvChange(CSV_EXAMPLE);
    setCsvText(CSV_EXAMPLE);
  }

  async function loadFile(file: File) {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    handleCsvChange(text);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) loadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  return (
    <div className="space-y-5">
      {/* Intro banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
        <TableProperties className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Geração em lote via CSV</p>
          <p className="mt-0.5 text-blue-600">
            Cole uma planilha CSV com os dados dos colaboradores e baixe todas
            as assinaturas em arquivos HTML individuais, prontos para uso no
            Gmail ou Outlook.
          </p>
        </div>
      </div>

      {/* Ações superiores */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleDownloadTemplate}
        >
          <FileDown className="h-3.5 w-3.5" />
          Baixar modelo CSV
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={handleLoadExample}
        >
          Carregar exemplo
        </Button>
      </div>

      {/* Formato esperado */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="mb-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Formato da planilha (colunas separadas por vírgula)
        </p>
        <code className="block text-[11px] leading-relaxed text-slate-600 break-all">
          nome, cargo, setor, telefone, email, template
        </code>
        <p className="mt-1.5 text-[11px] text-slate-400">
          A coluna <em>template</em> aceita <code>standard</code> (padrão) ou{" "}
          <code>compact</code>. Setor e telefone são opcionais. A linha de
          cabeçalho é ignorada automaticamente.
        </p>
      </div>

      {/* Área de upload / cole do CSV */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            Cole, arraste ou selecione o arquivo CSV
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Escolher arquivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Drop zone wrapping the textarea */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-md transition-colors ${
            isDragging ? "ring-2 ring-blue-500 bg-blue-50" : ""
          }`}
        >
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-blue-50/90">
              <UploadCloud className="h-8 w-8 text-blue-500" />
              <p className="text-sm font-medium text-blue-600">
                Solte o arquivo aqui
              </p>
            </div>
          )}
          <textarea
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows={8}
            placeholder={`nome,cargo,setor,telefone,email,template\nMaria da Silva,Coordenadora Pedagógica,Ensino Médio,(24) 3355-1389,maria@salesiano.br,standard`}
            value={csvText}
            onChange={(e) => handleCsvChange(e.target.value)}
            spellCheck={false}
          />
        </div>
        {hasParsed && (
          <p className="text-xs text-slate-500">
            {rows.length} linha(s) detectada(s) —{" "}
            <span className="text-green-600 font-medium">
              {validRows.length} válida(s)
            </span>
            {invalidRows.length > 0 && (
              <>
                {", "}
                <span className="text-red-600 font-medium">
                  {invalidRows.length} com erro
                </span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Tabela de preview das linhas */}
      {hasParsed && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-left text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2 font-semibold w-8">#</th>
                <th className="px-3 py-2 font-semibold">Nome</th>
                <th className="px-3 py-2 font-semibold hidden sm:table-cell">
                  Cargo
                </th>
                <th className="px-3 py-2 font-semibold hidden md:table-cell">
                  E-mail
                </th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const isValid = row.errors.length === 0;
                const isSelected = previewRow?.index === row.index;
                return (
                  <tr
                    key={row.index}
                    className={`transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-3 py-2 text-slate-400">{row.index}</td>
                    <td className="px-3 py-2 font-medium text-slate-700">
                      {row.data.name || (
                        <span className="text-red-400 italic">sem nome</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500 hidden sm:table-cell">
                      {row.data.role || "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-500 hidden md:table-cell">
                      {row.data.email || "—"}
                    </td>
                    <td className="px-3 py-2">
                      {isValid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                          <CheckCircle2 className="h-3 w-3" /> OK
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-red-700"
                          title={row.errors.join(", ")}
                        >
                          <AlertCircle className="h-3 w-3" /> Erro
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isValid && (
                        <button
                          type="button"
                          onClick={() => handlePreview(row)}
                          className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          {isSelected ? "Vendo" : "Ver"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview da assinatura selecionada */}
      {previewRow && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Preview — {previewRow.data.name}
            </p>
            <button
              type="button"
              onClick={() => setPreviewRow(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <iframe
              ref={iframeRef}
              title="batch-preview"
              className="w-full border-0"
              style={{ minHeight: "220px" }}
            />
          </div>
        </div>
      )}

      {/* Relatório pós-lote */}
      {report && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-green-800">
              ZIP gerado:{" "}
              <code className="font-mono text-xs">{report.zipFilename}</code>
            </p>
          </div>
          <ul className="text-xs text-green-700 space-y-0.5 pl-1">
            <li>
              • <strong>{report.generated}</strong> assinatura
              {report.generated !== 1 ? "s" : ""} gerada
              {report.generated !== 1 ? "s" : ""} com sucesso
            </li>
            <li>
              • <strong>{report.ignored.length}</strong> linha
              {report.ignored.length !== 1 ? "s" : ""} ignorada
              {report.ignored.length !== 1 ? "s" : ""} por erro
            </li>
          </ul>
          {report.ignored.length > 0 && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                Linhas ignoradas:
              </p>
              <ul className="text-xs text-amber-600 space-y-0.5">
                {report.ignored.map((r) => (
                  <li key={r.index}>
                    Linha {r.index}
                    {r.data.name ? ` (${r.data.name})` : ""} —{" "}
                    {r.errors.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Ação principal: baixar ZIP */}
      {validRows.length > 0 && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            disabled={downloading}
            onClick={handleDownloadZip}
            className="w-full gap-2 font-semibold bg-blue-900 hover:bg-blue-800 text-white hover:text-white disabled:opacity-75"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando ZIP… {downloadedCount}/{validRows.length}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar {validRows.length} assinatura
                {validRows.length !== 1 ? "s" : ""} em .zip
              </>
            )}
          </Button>
          {invalidRows.length > 0 && (
            <p className="text-center text-xs text-amber-600">
              {invalidRows.length} linha(s) com erro serão ignoradas.
            </p>
          )}
          <p className="text-center text-[11px] text-slate-400">
            Assinaturas geradas em HTML compatível com Outlook, Gmail e Apple
            Mail. Arquivos nomeados por colaborador.
          </p>
        </div>
      )}
    </div>
  );
}
