import { Button } from "@gouvfr-lasuite/ui-components";
import { Send } from "@gouvfr-lasuite/ui-components/icons";

export default function SuccessStep({ departingUserName, onReset }: { departingUserName: string, onReset: () => void }) {
  return (
    <div className="flex flex-col items-center text-center bg-white dark:bg-zinc-900 p-12 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 max-w-xl mx-auto animate-fade-in">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <Send size="xl" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">Opération réussie !</h2>
      <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
        Les transferts de propriété et suppressions pour l'agent <strong>{departingUserName}</strong> ont bien été validés et appliqués au Drive.
      </p>
      <Button variant="primary" onClick={onReset}>
        Terminer et retourner à l'accueil
      </Button>
    </div>
  );
}
