"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Download,
  PackageCheck,
  Pencil,
  Search,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildSignatureHTML } from "@/lib/signature-builder";
import type { SignatureData } from "@/types/signature";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedProfile {
  id: string;
  label: string;
  data: SignatureData;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "signature-salesiano:profiles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadProfiles(): SavedProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedProfile[];
  } catch {
    return [];
  }
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Mini iFrame Preview ──────────────────────────────────────────────────────

function MiniPreview({ data }: { data: SignatureData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const html = buildSignatureHTML(data);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    html, body { margin: 0; padding: 0; background: #fff; overflow: hidden; }
    body { padding: 10px; }
  </style>
</head>
<body>${html}</body>
</html>`);
    doc.close();
  }, [data]);

  // Renderiza a assinatura (mín 580px) dentro de um container de ~280px
  // usando transform: scale para encolher visualmente sem quebrar o layout HTML
  return (
    <div
      className="relative overflow-hidden rounded-lg bg-white"
      style={{ height: 130 }}
    >
      <div
        style={{
          width: 620,
          transformOrigin: "top left",
          transform: "scale(0.43)",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          title="preview"
          style={{
            width: 620,
            height: 300,
            border: "none",
            display: "block",
          }}
          scrolling="no"
        />
      </div>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: SavedProfile;
  onEdit: (profile: SavedProfile) => void;
}

function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    setDownloading(true);
    try {
      const html = buildSignatureHTML(profile.data);
      const blob = new Blob([html], { type: "text/html; charset=utf-8" });
      const filename = `${slugify(profile.data.name || profile.label)}.html`;
      downloadBlob(blob, filename);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  }

  const updatedDate = new Date(profile.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="border-b border-slate-100 bg-slate-50 px-3 pt-3 pb-0">
        <MiniPreview data={profile.data} />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="truncate text-sm font-semibold text-slate-800">
          {profile.label}
        </p>
        {profile.data.role && (
          <p className="truncate text-xs text-slate-500">{profile.data.role}</p>
        )}
        {profile.data.department && (
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            {profile.data.department}
          </p>
        )}
        <p className="mt-auto pt-2 text-[11px] text-slate-400">
          Atualizado em {updatedDate}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-100 p-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 text-xs cursor-pointer"
          onClick={() => onEdit(profile)}
        >
          <Pencil className="h-3 w-3" />
          Editar
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-1.5 text-xs cursor-pointer bg-[#003087] hover:bg-[#002266] text-white"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="h-3 w-3" />
          {downloading ? "Baixando…" : "Baixar"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProfileDashboardProps {
  /** Chamado quando o usuário clica em "Editar" — muda para aba Individual com o perfil carregado */
  onEditProfile: (profile: SavedProfile) => void;
}

export type { SavedProfile };

export function ProfileDashboard({ onEditProfile }: ProfileDashboardProps) {
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [query, setQuery] = useState("");
  const [zipping, setZipping] = useState(false);
  const [zipDone, setZipDone] = useState(false);

  // Carrega do localStorage somente no cliente
  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  // Re-sincroniza ao ganhar foco (caso o usuário salve um perfil e volte para esta aba)
  useEffect(() => {
    function onFocus() {
      setProfiles(loadProfiles());
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filtered = profiles.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.label.toLowerCase().includes(q) ||
      p.data.name.toLowerCase().includes(q) ||
      p.data.department.toLowerCase().includes(q) ||
      p.data.role.toLowerCase().includes(q)
    );
  });

  async function handleDownloadAll() {
    if (!profiles.length) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("assinaturas") ?? zip;
      for (const profile of profiles) {
        const html = buildSignatureHTML(profile.data);
        const filename = `${slugify(profile.data.name || profile.label)}.html`;
        folder.file(filename, html);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `assinaturas-equipe-${date}.zip`);
      setZipDone(true);
      setTimeout(() => setZipDone(false), 3000);
    } finally {
      setZipping(false);
    }
  }

  // ── Estado vazio ─────────────────────────────────────────────────────────────
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <Users className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="font-semibold text-slate-600">Nenhum perfil salvo</p>
          <p className="mt-1 text-sm text-slate-400">
            Vá para a aba{" "}
            <span className="font-medium text-slate-500">Individual</span>,
            preencha os dados de um colaborador e salve o perfil para que ele
            apareça aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Barra superior ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">
            {profiles.length} perfil{profiles.length !== 1 ? "is" : ""} salvo
            {profiles.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome, cargo ou setor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-64 pl-8 text-xs"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Download ZIP */}
          <Button
            size="sm"
            onClick={handleDownloadAll}
            disabled={zipping}
            className="gap-1.5 text-xs cursor-pointer bg-[#003087] hover:bg-[#002266] text-white"
          >
            {zipDone ? (
              <>
                <PackageCheck className="h-3.5 w-3.5" />
                Baixado!
              </>
            ) : zipping ? (
              <>
                <Download className="h-3.5 w-3.5 animate-bounce" />
                Gerando ZIP…
              </>
            ) : (
              <>
                <PackageCheck className="h-3.5 w-3.5" />
                Baixar todos (ZIP)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Resultados da busca ──────────────────────────────────────────────── */}
      {query && filtered.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-400">
          Nenhum perfil encontrado para{" "}
          <span className="font-medium">&ldquo;{query}&rdquo;</span>.
        </div>
      )}

      {/* ── Grid de cards ────────────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={onEditProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
