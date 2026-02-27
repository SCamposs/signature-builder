import { AppShell } from "@/components/layout/AppShell";
import { SignatureGenerator } from "@/components/signature/SignatureGenerator";

export default function Home() {
  return (
    <AppShell>
      <SignatureGenerator />
    </AppShell>
  );
}
