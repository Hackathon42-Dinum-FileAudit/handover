import { Select, Button } from "@gouvfr-lasuite/ui-components";

const extractValue = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if ("value" in v) return v.value;
    if (v.target && "value" in v.target) return v.target.value;
  }
  return "";
};

export default function AgentSelectionStep({
  selectedDepartingUser,
  setSelectedDepartingUser,
  agents,
  onNext,
  onBack
}: any) {
  return (
    <div className="flex flex-col items-center bg-white dark:bg-zinc-900 p-10 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-lg mx-auto animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">Sélection de l'agent</h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-center">
        Veuillez sélectionner l'agent sur le départ dont vous souhaitez gérer l'espace.
      </p>

      <div className="w-full mb-10">
        <Select
          label="Agent sortant"
          value={selectedDepartingUser}
          onChange={(v: any) => setSelectedDepartingUser(extractValue(v))}
          options={agents}
          searchable
        />
      </div>

      <div className="flex w-full justify-between">
        <Button variant="secondary" onClick={onBack}>Retour</Button>
        <Button variant="primary" onClick={onNext} disabled={!selectedDepartingUser}>
          Démarrer l'audit
        </Button>
      </div>
    </div>
  );
}
