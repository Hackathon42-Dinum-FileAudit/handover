"use client";
import { useState } from "react";
import { Footer, Header } from "@gouvfr-lasuite/ui-components";

// Import de nos composants (assure-toi qu'ils sont bien dans le dossier /components)
import WelcomeStep from "./components/WelcomeStep";
import AgentSelectionStep from "./components/AgentSelectionStep";
import AuditStep from "./components/AuditStep";
import SuccessStep from "./components/SuccessStep";

// --- DONNÉES FACTICES DE L'API ---
const mockApiResponse = {
  items: [
    { id: "1", title: "Budget Prévisionnel", type: "folder" },
    {
      id: "2", title: "Documents RH", type: "folder",
      children: [
        { id: "2-1", title: "contrat_travail.pdf", type: "file", mimetype: "application/pdf" },
      ]
    }
  ],
  departing_user: {
    id: "2c6c1f9f-9b0a-46b9-be85-d63983d1a750",
    full_name: "Jean Dupont (Agent Sortant)"
  }
};

const transformApiDataToTreeData = (items: any[]): any[] => {
  if (!items) return [];
  return items.map((item) => {
    const isFolder = item.type === "folder";
    return {
      id: String(item.id), label: item.title, type: item.type,
      mimetype: item.mimetype || (isFolder ? null : "application/octet-stream"),
      children: isFolder ? transformApiDataToTreeData(item.children || []) : undefined,
    };
  });
};

const treeData = transformApiDataToTreeData(mockApiResponse.items);
const AGENTS = [
  { label: mockApiResponse.departing_user.full_name, value: mockApiResponse.departing_user.id },
  { label: 'Sophie Vigier', value: 'sophie-vigier' },
  { label: 'Monsieur Blackhole', value: 'monsieur-blackhole' }
];

// --- COMPOSANT : LA PROGRESS BAR (Mise à jour avec les couleurs sémantiques) ---
function Stepper({ currentStep }: { currentStep: number }) {
  // On ne l'affiche pas sur l'étape 0 (Bienvenue)
  if (currentStep === 0) return null;

  const steps = [1, 2, 3];

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {steps.map((s, index) => {
        const isActive = currentStep >= s;
        const isLast = index === steps.length - 1;

        return (
          <div key={s} className="flex items-center">
            {/* Le Cercle */}
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
                isActive
                  ? 'bg-semantic-brand-primary text-white shadow-sm' // Couleur "Primary" du Design System
                  : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600' // Inactif
              }`}
            >
              {s}
            </div>

            {/* La ligne de connexion (sauf pour le dernier cercle) */}
            {!isLast && (
              <div
                className={`w-10 h-1 mx-1 transition-colors duration-300 rounded-full ${
                  currentStep > s
                    ? 'bg-semantic-brand-primary' // Ligne remplie avec la couleur du Design System
                    : 'bg-zinc-200 dark:bg-zinc-800' // Ligne vide
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedDepartingUser, setSelectedDepartingUser] = useState(mockApiResponse.departing_user.id);

  const departingUserName = AGENTS.find(a => a.value === selectedDepartingUser)?.label || "Agent inconnu";

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">

      {/* On encapsule le Header et le Stepper dans une div relative */}
      <div className="relative w-full border-b border-zinc-200 dark:border-zinc-800">
        <Header
          leftIcon={<span className="font-semibold text-lg">Offboarding</span>}
          isPanelOpen={false}
          onTogglePanel={() => {}}
        />
        {/* Affichage du Stepper */}
        <Stepper currentStep={step} />
      </div>

      <main className={`flex-1 w-full max-w-7xl mx-auto px-6 py-12 sm:px-8 flex flex-col ${step === 2 ? 'justify-start' : 'justify-center'}`}>

        {step === 0 && (
          <WelcomeStep onNext={() => setStep(1)} />
        )}

        {step === 1 && (
          <AgentSelectionStep
            selectedDepartingUser={selectedDepartingUser}
            setSelectedDepartingUser={setSelectedDepartingUser}
            agents={AGENTS}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <AuditStep
            departingUserName={departingUserName}
            treeData={treeData}
            onFinish={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <SuccessStep
            departingUserName={departingUserName}
            onReset={() => { setStep(0); setSelectedDepartingUser(mockApiResponse.departing_user.id); }}
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
