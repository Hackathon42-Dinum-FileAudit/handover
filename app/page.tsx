"use client";
import { useState } from "react";
import { Footer, Header, Spinner } from "@gouvfr-lasuite/ui-components";

import WelcomeStep from "./components/WelcomeStep";
import AgentSelectionStep from "./components/AgentSelectionStep";
import AuditStep from "./components/AuditStep";
import SuccessStep from "./components/SuccessStep";

interface HandoverAuditItem {
  id: string;
  title: string;
  type: "file" | "folder";
  size: number | null;
  parent_id: string | null;
}

const buildTreeFromFlatList = (flatItems: HandoverAuditItem[]): any[] => {
  if (!flatItems || flatItems.length === 0) return [];
  const itemMap: Record<string, any> = {};
  const rootNodes: any[] = [];
  flatItems.forEach(item => {
    itemMap[item.id] = {
      id: String(item.id),
      label: item.title,
      type: item.type,
      mimetype: item.type === "folder" ? null : "application/octet-stream",
      children: item.type === "folder" ? [] : undefined,
      originalData: item
    };
  });
  flatItems.forEach(item => {
    const currentNode = itemMap[item.id];
    if (item.parent_id && itemMap[item.parent_id]) {
      if (itemMap[item.parent_id].children) {
        itemMap[item.parent_id].children.push(currentNode);
      }
    } else {
      rootNodes.push(currentNode);
    }
  });
  return rootNodes;
};

const AGENTS = [
  { label: 'John Doe', value: '2c6c1f9f-9b0a-46b9-be85-d63983d1a750' },
  { label: 'Peter Parker', value: 'peter-parker' },
  { label: 'Mike Tyson', value: 'mike-tyson' }
];

function Stepper({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null;
  const steps = [1, 2, 3];
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {steps.map((s, index) => {
        const isActive = currentStep >= s;
        const isLast = index === steps.length - 1;
        return (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
                isActive ? 'bg-semantic-brand-primary text-white shadow-sm' : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
              }`}>
              {s}
            </div>
            {!isLast && (
              <div className={`w-10 h-1 mx-1 transition-colors duration-300 rounded-full ${
                  currentStep > s ? 'bg-semantic-brand-primary' : 'bg-zinc-200 dark:bg-zinc-800'
                }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedDepartingUser, setSelectedDepartingUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // NOUVEAU : État pour stocker les données du rapport PDF
  const [reportData, setReportData] = useState<any>(null);

  const departingUserName = AGENTS.find(a => a.value === selectedDepartingUser)?.label || "Agent inconnu";

  const handleLogin = async () => {
    try {
      await fetch('/api/v1.0/e2e/user-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'manager@example.com' })
      });
      setStep(1);
    } catch (error) {
      console.error("Erreur d'authentification :", error);
      alert("Impossible de joindre le serveur d'authentification.");
    }
  };

  const handleStartAudit = async () => {
    setStep(2);
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`/api/v1.0/users/${selectedDepartingUser}/handover/audit/`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error(`Erreur réseau (${response.status})`);
      const data = await response.json();
      setTreeData(buildTreeFromFlatList(data.items));
    } catch (error: any) {
      console.error("Erreur API:", error);
      setApiError("Impossible de charger les données de l'agent. Vérifiez que votre serveur Drive tourne bien.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="relative w-full border-b border-zinc-200 dark:border-zinc-800">
        <Header
          leftIcon={
            <div className="flex items-center gap-3">
              <img src="/logo-passation.svg" alt="Logo Passation" className="h-15 w-auto" />
              <span className="font-semibold text-lg">Passation</span>
            </div>
          }
          isPanelOpen={false}
          onTogglePanel={() => {}}
        />
        <Stepper currentStep={step} />
      </div>

      <main className={`flex-1 w-full max-w-7xl mx-auto px-6 py-12 sm:px-8 flex flex-col ${step === 2 ? 'justify-start' : 'justify-center'}`}>
        {step === 0 && <WelcomeStep onNext={handleLogin} />}

        {step === 1 && (
          <AgentSelectionStep
            selectedDepartingUser={selectedDepartingUser}
            setSelectedDepartingUser={setSelectedDepartingUser}
            agents={AGENTS}
            onBack={() => setStep(0)}
            onNext={handleStartAudit}
          />
        )}

        {step === 2 && (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center flex-1 h-64 gap-4">
                <Spinner size="lg" />
                <p className="text-zinc-500 font-medium animate-pulse">Analyse de l'espace Drive en cours...</p>
              </div>
            ) : apiError ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center border border-red-200">
                <p className="font-bold mb-2">Oups !</p>
                <p>{apiError}</p>
                <button onClick={() => setStep(1)} className="mt-4 underline font-medium">Retour à la sélection</button>
              </div>
            ) : (
              <AuditStep
                departingUserName={departingUserName}
                departingUserId={selectedDepartingUser}
                treeData={treeData}
                // NOUVEAU : Récupération du reportData
                onFinish={(data: any) => { setReportData(data); setStep(3); }}
              />
            )}
          </>
        )}

        {step === 3 && (
          // NOUVEAU : On passe le reportData au composant SuccessStep
          <SuccessStep
            departingUserName={departingUserName}
            reportData={reportData}
            onReset={() => { setStep(0); setSelectedDepartingUser(""); setTreeData([]); setReportData(null); }}
          />
        )}
      </main>

      <Footer
        externalLinks={[{ href: "https://legifrance.gouv.fr/", label: "legifrance.gouv.fr" }]}
        legalLinks={[{ href: "/legal-notice", label: "Legal Mentions" }]}
        license={{ label: "Contenu sous", link: { href: "#", label: "licence etalab-2.0" } }}
      />
    </div>
  );
}
