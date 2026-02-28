"use client";

import { useState, useCallback, Suspense } from "react";
import { LayoutTemplate, TableProperties, Users } from "lucide-react";
import { SignatureForm } from "@/components/signature/SignatureForm";
import { SignaturePreview } from "@/components/signature/SignaturePreview";
import { BatchGenerator } from "@/components/signature/BatchGenerator";
import {
  ProfileDashboard,
  type SavedProfile,
} from "@/components/signature/ProfileDashboard";
import type { SignatureData } from "@/types/signature";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SignatureGenerator() {
  const [activeTab, setActiveTab] = useState("individual");
  const [signatureData, setSignatureData] = useState<SignatureData | null>(
    null,
  );
  const [liveData, setLiveData] = useState<SignatureData | null>(null);
  const [loadProfileRequest, setLoadProfileRequest] = useState<{
    profileId: string;
    key: number;
  } | null>(null);

  // Callback estável para não re-disparar o debounce desnecessariamente
  const handleFormChange = useCallback((data: SignatureData) => {
    setLiveData(data);
  }, []);

  // Ao gerar explicitamente, limpa o estado "ao vivo" pois a origem é a mesma
  function handleGenerate(data: SignatureData) {
    setSignatureData(data);
    setLiveData(null);
  }

  // Chamado pelo ProfileDashboard ao clicar "Editar" num perfil
  function handleEditProfile(profile: SavedProfile) {
    setLoadProfileRequest((prev) => ({
      profileId: profile.id,
      key: (prev?.key ?? 0) + 1,
    }));
    setActiveTab("individual");
  }

  // preview = dado gerado explicitamente, ou preview ao vivo enquanto apenas digitando
  const previewData = signatureData ?? liveData;
  const isLive = signatureData === null && liveData !== null;

  return (
    <div className="mx-auto max-w-7xl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
          <TabsTrigger value="individual" className="gap-2">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2">
            <TableProperties className="h-3.5 w-3.5" />
            Em lote
          </TabsTrigger>
          <TabsTrigger value="equipe" className="gap-2">
            <Users className="h-3.5 w-3.5" />
            Equipe
          </TabsTrigger>
        </TabsList>

        {/* ── ABA INDIVIDUAL ─────────────────────────────────── */}
        <TabsContent value="individual">
          <p className="mb-5 text-sm text-slate-500">
            Preencha seus dados abaixo para gerar uma assinatura padronizada.
            <br className="hidden sm:block" />
            Após gerar, copie e cole diretamente nas configurações do seu
            cliente de e-mail.
          </p>

          <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Seus dados
              </h2>
              <Suspense
                fallback={
                  <div className="h-48 animate-pulse rounded-lg bg-slate-100" />
                }
              >
                <SignatureForm
                  onGenerate={handleGenerate}
                  onFormChange={handleFormChange}
                  loadProfileRequest={loadProfileRequest}
                />
              </Suspense>
            </Card>

            <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preview &amp; Cópia
              </h2>
              <SignaturePreview data={previewData} isLive={isLive} />
            </Card>
          </div>

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            <span className="font-semibold">Dica:</span> Para usar no Gmail,
            acesse{" "}
            <code className="inline-block break-all rounded bg-blue-100 px-1 py-0.5">
              Configurações → Ver todas as configurações → Aba &quot;Geral&quot;
              → Assinatura
            </code>
            . No Outlook:{" "}
            <code className="inline-block break-all rounded bg-blue-100 px-1 py-0.5">
              Arquivo → Opções → Email → Assinaturas
            </code>
            .
          </div>
        </TabsContent>

        {/* ── ABA EM LOTE ────────────────────────────────────── */}
        <TabsContent value="batch">
          <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <BatchGenerator />
          </Card>
        </TabsContent>

        {/* ── ABA EQUIPE ─────────────────────────────────────── */}
        <TabsContent value="equipe">
          <p className="mb-5 text-sm text-slate-500">
            Todos os perfis salvos da equipe. Clique em{" "}
            <span className="font-medium text-slate-600">Editar</span> para
            abrir na aba Individual, ou{" "}
            <span className="font-medium text-slate-600">Baixar</span> para
            obter o HTML diretamente.
          </p>
          <ProfileDashboard onEditProfile={handleEditProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
