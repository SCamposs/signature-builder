"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  emptySignature,
  type SignatureData,
  type SignatureTemplate,
} from "@/types/signature";
import {
  formatPhoneMask,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "@/lib/input-masks";

interface SignatureFormProps {
  onGenerate: (data: SignatureData) => void;
  onFormChange?: (data: SignatureData) => void;
  /** Quando alterado, carrega o perfil com esse id no formulário */
  loadProfileRequest?: { profileId: string; key: number } | null;
}

interface FieldError {
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
}

interface SavedProfile {
  id: string;
  label: string;
  data: SignatureData;
  updatedAt: string;
}

const STORAGE_KEY = "signature-builder-v1:profiles";

export function SignatureForm({
  onGenerate,
  onFormChange,
  loadProfileRequest,
}: SignatureFormProps) {
  const searchParams = useSearchParams();
  const encodedParam = searchParams.get("d");

  // Inicializador preguiçoso: roda apenas uma vez no mount
  const [form, setForm] = useState<SignatureData>(() => {
    if (!encodedParam) return emptySignature;
    try {
      const decoded = JSON.parse(atob(encodedParam)) as Partial<SignatureData>;
      return {
        ...emptySignature,
        ...decoded,
        template:
          decoded.template === "compact" || decoded.template === "latest"
            ? decoded.template
            : "standard",
      } as SignatureData;
    } catch {
      return emptySignature;
    }
  });
  const [linkCopied, setLinkCopied] = useState(false);

  const [errors, setErrors] = useState<FieldError>({});
  const [profiles, setProfiles] = useState<SavedProfile[]>(loadProfiles);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [profileLabel, setProfileLabel] = useState("");
  const [profileMessage, setProfileMessage] = useState<string>(
    encodedParam ? "Formulário pré-preenchido via link compartilhado." : "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live preview: notifica o componente pai após 450ms de inatividade
  useEffect(() => {
    if (!onFormChange) return;
    const timer = setTimeout(() => onFormChange(form), 450);
    return () => clearTimeout(timer);
  }, [form, onFormChange]);

  // Carregamento externo de perfil (vindo do dashboard "Equipe")
  useEffect(() => {
    if (!loadProfileRequest) return;
    const fresh = loadProfiles();
    const profile = fresh.find((p) => p.id === loadProfileRequest.profileId);
    if (!profile) return;
    setProfiles(fresh);
    setForm(profile.data);
    setSelectedProfileId(profile.id);
    setProfileLabel(profile.label);
    setErrors({});
    onGenerate(profile.data);
    showProfileMessage(`Perfil "${profile.label}" carregado do diretório.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadProfileRequest?.key]);

  function persistProfiles(nextProfiles: SavedProfile[]) {
    setProfiles(nextProfiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfiles));
  }

  function showProfileMessage(message: string) {
    setProfileMessage(message);
    setTimeout(() => setProfileMessage(""), 3500);
  }

  function normalizeProfileLabel() {
    const fromInput = profileLabel.trim();
    if (fromInput) return fromInput;

    const fromName = form.name.trim();
    if (fromName) return fromName;

    return "Perfil sem nome";
  }

  function handleSaveProfile() {
    const label = normalizeProfileLabel();
    const now = new Date().toISOString();

    if (selectedProfileId) {
      const nextProfiles = profiles.map((profile) =>
        profile.id === selectedProfileId
          ? { ...profile, label, data: form, updatedAt: now }
          : profile,
      );
      persistProfiles(nextProfiles);
      showProfileMessage("Perfil atualizado com sucesso.");
      return;
    }

    const newProfile: SavedProfile = {
      id: crypto.randomUUID(),
      label,
      data: form,
      updatedAt: now,
    };

    const nextProfiles = [newProfile, ...profiles];
    persistProfiles(nextProfiles);
    setSelectedProfileId(newProfile.id);
    setProfileLabel(newProfile.label);
    showProfileMessage("Perfil salvo com sucesso.");
  }

  function handleApplyProfile() {
    if (!selectedProfileId) return;

    const profile = profiles.find((item) => item.id === selectedProfileId);
    if (!profile) return;

    setForm(profile.data);
    setProfileLabel(profile.label);
    setErrors({});
    onGenerate(profile.data);
    showProfileMessage("Perfil aplicado.");
  }

  function handleDeleteProfile() {
    if (!selectedProfileId) return;

    const nextProfiles = profiles.filter(
      (profile) => profile.id !== selectedProfileId,
    );

    persistProfiles(nextProfiles);
    setSelectedProfileId("");
    setProfileLabel("");
    showProfileMessage("Perfil excluído.");
  }

  function handleNewProfile() {
    setSelectedProfileId("");
    setProfileLabel("");
    showProfileMessage("Pronto para um novo perfil.");
  }

  function handleProfileSelect(nextId: string) {
    setSelectedProfileId(nextId);

    const profile = profiles.find((item) => item.id === nextId);
    setProfileLabel(profile?.label ?? "");
  }

  function handleTemplateChange(value: string) {
    setForm((prev) => ({ ...prev, template: value as SignatureTemplate }));
  }

  async function handleShareLink() {
    try {
      const encoded = btoa(JSON.stringify(form));
      const url = `${window.location.origin}${window.location.pathname}?d=${encoded}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      showProfileMessage("Não foi possível copiar o link.");
    }
  }

  function handleExportProfiles() {
    if (!profiles.length) {
      showProfileMessage("Não há perfis para exportar.");
      return;
    }

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profiles,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `assinatura-perfis-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    showProfileMessage("Perfis exportados.");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportProfiles(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as {
        profiles?: SavedProfile[];
      };

      const importedProfiles = sanitizeImportedProfiles(parsed.profiles);
      if (!importedProfiles.length) {
        showProfileMessage("Arquivo sem perfis válidos.");
        return;
      }

      const merged = mergeProfiles(profiles, importedProfiles);
      persistProfiles(merged);
      showProfileMessage(
        `${importedProfiles.length} perfil(is) importado(s) com sucesso.`,
      );
    } catch {
      showProfileMessage("Não foi possível importar o arquivo JSON.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    let processedValue = value;

    // Aplicar máscara de telefone
    if (name === "phone") {
      processedValue = formatPhoneMask(value);
    }

    setForm((prev) => ({ ...prev, [name]: processedValue }));

    if (errors[name as keyof FieldError]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FieldError = {};

    if (!form.name.trim()) {
      newErrors.name = "Nome é obrigatório.";
    }

    if (!form.role.trim()) {
      newErrors.role = "Cargo é obrigatório.";
    }

    if (!form.email.trim()) {
      newErrors.email = "E-mail é obrigatório.";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "Informe um e-mail válido.";
    }

    if (form.phone.trim() && !isValidPhone(form.phone)) {
      newErrors.phone = "Telefone inválido. Use (XX) XXXXX-XXXX";
    }

    if (form.facebookUrl.trim() && !isValidUrl(form.facebookUrl)) {
      newErrors.facebookUrl = "URL inválida.";
    }

    if (form.instagramUrl.trim() && !isValidUrl(form.instagramUrl)) {
      newErrors.instagramUrl = "URL inválida.";
    }

    if (form.linkedinUrl.trim() && !isValidUrl(form.linkedinUrl)) {
      newErrors.linkedinUrl = "URL inválida.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onGenerate(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Perfis salvos
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="savedProfile">Perfil</Label>
          <Select value={selectedProfileId} onValueChange={handleProfileSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um perfil salvo" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profileLabel">Nome do perfil</Label>
          <Input
            id="profileLabel"
            value={profileLabel}
            onChange={(e) => setProfileLabel(e.target.value)}
            placeholder="Ex: Ana Carolina- Coordenação"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={handleSaveProfile}
            className="text-xs sm:text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white hover:text-white"
          >
            Salvar perfil
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyProfile}
            className="text-xs sm:text-sm"
          >
            Aplicar perfil
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleNewProfile}
            className="text-xs sm:text-sm"
          >
            Novo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteProfile}
            disabled={!selectedProfileId}
            className="text-xs sm:text-sm"
          >
            Excluir
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportProfiles}
            className="text-xs sm:text-sm"
          >
            Exportar JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleImportClick}
            className="text-xs sm:text-sm"
          >
            Importar JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleShareLink}
            className="col-span-2 gap-2"
          >
            {linkCopied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Link copiado!
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" /> Compartilhar pré-preenchimento
              </>
            )}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportProfiles}
          className="hidden"
        />

        {profileMessage && (
          <p className="text-xs text-slate-500" aria-live="polite">
            {profileMessage}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template">Modelo da assinatura</Label>
        <Select value={form.template} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Nova versão</SelectItem>
            <SelectItem value="standard">Padrão (completo)</SelectItem>
            <SelectItem value="compact">Compacto (mais curto)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">
          Nome completo <span className="text-red-600">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ex: Maria da Silva"
          aria-describedby={errors.name ? "name-error" : undefined}
          aria-invalid={!!errors.name}
          className={
            errors.name ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">
          Cargo / Função <span className="text-red-600">*</span>
        </Label>
        <Input
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Ex: Coordenadora Pedagógica"
          aria-describedby={errors.role ? "role-error" : undefined}
          aria-invalid={!!errors.role}
          className={
            errors.role ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.role && (
          <p id="role-error" className="text-xs text-red-600">
            {errors.role}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="department">Setor / Departamento</Label>
        <Input
          id="department"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Ex: Ensino Médio"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone direto</Label>
        <Input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Ex: (24) 3355-1389"
          type="tel"
          aria-describedby={errors.phone ? "phone-error" : undefined}
          aria-invalid={!!errors.phone}
          className={
            errors.phone ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.phone && (
          <p id="phone-error" className="text-xs text-red-600">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          E-mail institucional <span className="text-red-600">*</span>
        </Label>
        <Input
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Ex: maria.silva@salesiano.br"
          type="email"
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
          className={
            errors.email ? "border-red-500 focus-visible:ring-red-400" : ""
          }
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-red-600">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="facebookUrl">Facebook (opcional)</Label>
        <Input
          id="facebookUrl"
          name="facebookUrl"
          value={form.facebookUrl}
          onChange={handleChange}
          placeholder="Ex: https://facebook.com/seu.perfil"
          type="url"
          aria-describedby={
            errors.facebookUrl ? "facebookUrl-error" : undefined
          }
          aria-invalid={!!errors.facebookUrl}
          className={
            errors.facebookUrl
              ? "border-red-500 focus-visible:ring-red-400"
              : ""
          }
        />
        {errors.facebookUrl && (
          <p id="facebookUrl-error" className="text-xs text-red-600">
            {errors.facebookUrl}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="instagramUrl">Instagram (opcional)</Label>
        <Input
          id="instagramUrl"
          name="instagramUrl"
          value={form.instagramUrl}
          onChange={handleChange}
          placeholder="Ex: https://instagram.com/seu.perfil"
          type="url"
          aria-describedby={
            errors.instagramUrl ? "instagramUrl-error" : undefined
          }
          aria-invalid={!!errors.instagramUrl}
          className={
            errors.instagramUrl
              ? "border-red-500 focus-visible:ring-red-400"
              : ""
          }
        />
        {errors.instagramUrl && (
          <p id="instagramUrl-error" className="text-xs text-red-600">
            {errors.instagramUrl}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="linkedinUrl">LinkedIn (opcional)</Label>
        <Input
          id="linkedinUrl"
          name="linkedinUrl"
          value={form.linkedinUrl}
          onChange={handleChange}
          placeholder="Ex: https://linkedin.com/in/seu-perfil"
          type="url"
          aria-describedby={
            errors.linkedinUrl ? "linkedinUrl-error" : undefined
          }
          aria-invalid={!!errors.linkedinUrl}
          className={
            errors.linkedinUrl
              ? "border-red-500 focus-visible:ring-red-400"
              : ""
          }
        />
        {errors.linkedinUrl && (
          <p id="linkedinUrl-error" className="text-xs text-red-600">
            {errors.linkedinUrl}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full font-semibold bg-blue-900 hover:bg-blue-800 cursor-pointer text-white hover:text-white"
      >
        Gerar assinatura
      </Button>
    </form>
  );
}

function sanitizeImportedProfiles(
  value: SavedProfile[] | undefined,
): SavedProfile[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (profile) =>
        typeof profile?.id === "string" &&
        typeof profile?.label === "string" &&
        typeof profile?.updatedAt === "string" &&
        typeof profile?.data?.name === "string" &&
        typeof profile?.data?.role === "string" &&
        typeof profile?.data?.department === "string" &&
        typeof profile?.data?.phone === "string" &&
        typeof profile?.data?.email === "string" &&
        typeof profile?.data?.facebookUrl === "string" &&
        typeof profile?.data?.instagramUrl === "string" &&
        typeof profile?.data?.linkedinUrl === "string",
    )
    .map((profile) => ({
      id: profile.id,
      label: profile.label.trim() || "Perfil sem nome",
      updatedAt: profile.updatedAt,
      data: ensureSignatureData(profile.data),
    }));
}

function sanitizeStoredProfiles(value: unknown[]): SavedProfile[] {
  return value
    .filter(
      (profile) =>
        typeof profile === "object" &&
        profile !== null &&
        "id" in profile &&
        "label" in profile &&
        "updatedAt" in profile &&
        "data" in profile,
    )
    .map((profile) => profile as SavedProfile)
    .filter(
      (profile) =>
        typeof profile.id === "string" &&
        typeof profile.label === "string" &&
        typeof profile.updatedAt === "string",
    )
    .map((profile) => ({
      id: profile.id,
      label: profile.label.trim() || "Perfil sem nome",
      updatedAt: profile.updatedAt,
      data: ensureSignatureData(profile.data),
    }));
}

function ensureSignatureData(data: SignatureData): SignatureData {
  return {
    ...emptySignature,
    ...data,
    template:
      data?.template === "compact" || data?.template === "latest"
        ? data.template
        : "standard",
  };
}

function loadProfiles(): SavedProfile[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return sanitizeStoredProfiles(parsed);
  } catch {
    return [];
  }
}

function mergeProfiles(
  currentProfiles: SavedProfile[],
  importedProfiles: SavedProfile[],
): SavedProfile[] {
  const map = new Map<string, SavedProfile>();

  for (const profile of currentProfiles) {
    map.set(profile.id, profile);
  }

  for (const profile of importedProfiles) {
    map.set(profile.id, profile);
  }

  return Array.from(map.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}
