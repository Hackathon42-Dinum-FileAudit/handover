"use client";
import { useState, createContext, useContext } from "react";
import { Tree } from "react-arborist";

// UI-kit Components
import { Footer } from "@gouvfr-lasuite/ui-components";
import { Header } from "@gouvfr-lasuite/ui-components";
import { Select } from "@gouvfr-lasuite/ui-components";
import { Button } from "@gouvfr-lasuite/ui-components";
import { Checkbox } from "@gouvfr-lasuite/ui-components";

// UI-kit Icons
import { ArrowLeftRight } from "@gouvfr-lasuite/ui-components/icons";
import { Trash } from "@gouvfr-lasuite/ui-components/icons";
import { Undo } from "@gouvfr-lasuite/ui-components/icons";
import { Retry } from "@gouvfr-lasuite/ui-components/icons";
import { Send } from "@gouvfr-lasuite/ui-components/icons";

// Data
const data = [
  {
    id: "1",
    label: "Dossier A",
    children: [
      { id: "1-1", label: "Sous-dossier 1" },
      { id: "1-2", label: "Sous-dossier 2" },
    ],
  },
  { id: "2", label: "Dossier B" },
  {
    id: "3",
    label: "Dossier C",
    children: [
      { id: "3-1", label: "Sous-dossier 1" },
      { id: "3-2",
        label: "Dossier C-1",
        children: [
          { id: "3-2-1", label: "Sous-dossier 1" },
          { id: "3-2-2", label: "Sous-dossier 2" },
        ],
      },
      { id: "3-3",
        label: "Dossier C-2",
        children: [
          { id: "3-3-1", label: "Sous-dossier 1" },
          { id: "3-3-2", label: "Sous-dossier 2" },
        ],
      }
    ]
  },
];

const TreeContext = createContext<any>(null);

// Extraction sécurisée de la valeur du Select
const extractValue = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if ("value" in v) return v.value;
    if (v.target && "value" in v.target) return v.target.value;
  }
  return "";
};

// Composant DeleteButton refactorisé pour utiliser les props
function DeleteButton({ isTrashed, onToggle }: { isTrashed: boolean, onToggle: () => void }) {
  return (
    <Button
      aria-label={isTrashed ? "Restore" : "Delete"}
      icon={isTrashed ? <Undo /> : <Trash />}
      variant="primary"
      color={isTrashed ? "success" : "error"}
      onClick={onToggle}
    />
  );
}

// Composant Node
function Node({ node, style, dragHandle }: any) {
  const {
    checkboxStates,
    toggleNode,
    rowTargets,
    updateRowTarget,
    trashedStates,
    toggleTrash
  } = useContext(TreeContext);

  // États de la ligne
  const isTrashed = trashedStates[node.id] || false;
  const cbState = checkboxStates[node.id] || 'unchecked';

  const isChecked = cbState === 'checked' || cbState === 'indeterminate';
  const isIndeterminate = cbState === 'indeterminate';

  // Classes conditionnelles pour griser la ligne si elle est désactivée
  const rowClasses = isTrashed
    ? "bg-zinc-100 opacity-50 grayscale dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 pointer-events-none"
    : "border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-800";

  return (
    <div
      style={style}
      // La div parente n'a plus pointer-events-none globalement pour laisser le bouton Undo cliquable,
      // on le gère sur les éléments internes
      className={`flex items-center gap-4 w-full pr-4 group min-w-0 border-b box-border transition-all duration-200 ${rowClasses}`}
    >
      <div
        className={`flex items-center h-full ${isTrashed ? 'pointer-events-auto' : ''}`}
        style={{ paddingLeft: `${node.level * 24}px` }}
      >
        {node.isInternal ? (
          <button
            onClick={(e) => {
              // Permet d'ouvrir/fermer même si c'est grisé
              e.stopPropagation();
              node.toggle();
            }}
            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <span className="text-xs">{node.isOpen ? '▼' : '▶'}</span>
          </button>
        ) : (
          <span className="w-8 h-8"></span>
        )}
      </div>

      <div className={`flex-shrink-0 flex items-center ${isTrashed ? 'pointer-events-none' : ''}`}>
        <Checkbox
          checked={isChecked}
          indeterminate={isIndeterminate}
          onChange={() => toggleNode(node)}
          disabled={isTrashed} // Ajout de la prop disabled
        />
      </div>

      <span className="flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
        {node.data.label}
      </span>

      <div className={`w-48 sm:w-64 flex-shrink-0 flex items-center ${isTrashed ? 'pointer-events-none' : ''}`}>
        <Select
          label="Select target user"
          options={[
            { label: 'Sophie Vigier', value: 'sophie-vigier' },
            { label: 'Grégoire Martinez', value: 'gregoire-martinez' },
            { label: 'Monsieur Blackhole', value: 'monsieur-blackhole' }
          ]}
          searchable
          value={rowTargets[node.id] || undefined}
          onChange={(v: any) => updateRowTarget(node.id, extractValue(v))}
          disabled={isTrashed} // Ajout de la prop disabled
        />
      </div>

      <div className="flex-shrink-0 flex items-center pointer-events-auto">
        <DeleteButton
          isTrashed={isTrashed}
          onToggle={() => toggleTrash(node)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [globalTarget, setGlobalTarget] = useState("");
  const [checkboxStates, setCheckboxStates] = useState<Record<string, string>>({});
  const [rowTargets, setRowTargets] = useState<Record<string, string>>({});
  const [trashedStates, setTrashedStates] = useState<Record<string, boolean>>({});

  // Logique métier : Suppression (Trash)
  const toggleTrash = (node: any) => {
    const willBeTrashed = !trashedStates[node.id]; // Si c'était false, ça devient true (supprimé)

    const nextTrashed = { ...trashedStates };
    const nextTargets = { ...rowTargets };
    const nextCheckboxes = { ...checkboxStates };

    // Fonction récursive pour appliquer l'état à ce nœud et tous ses enfants
    const applyTrashToNodeAndChildren = (n: any) => {
      nextTrashed[n.id] = willBeTrashed;

      if (willBeTrashed) {
        // "ça enlève le user sélectionné"
        delete nextTargets[n.id];
        // On décoche également pour éviter les conflits
        nextCheckboxes[n.id] = 'unchecked';
      }

      if (n.children && n.children.length > 0) {
        n.children.forEach((child: any) => applyTrashToNodeAndChildren(child));
      }
    };

    applyTrashToNodeAndChildren(node);

    setTrashedStates(nextTrashed);
    setRowTargets(nextTargets);
    setCheckboxStates(nextCheckboxes);
  };

  // Logique métier : Checkboxes
  const toggleNode = (node: any) => {
    // Si le nœud est supprimé, on ignore le clic
    if (trashedStates[node.id]) return;

    const currentState = checkboxStates[node.id] || 'unchecked';
    let newState = 'unchecked';
    let childState = 'unchecked';

    if (currentState === 'unchecked') {
      newState = 'checked';
      childState = 'indeterminate';
    } else if (currentState === 'checked') {
      newState = 'unchecked';
      childState = 'unchecked';
    } else if (currentState === 'indeterminate') {
      newState = 'unchecked';
      childState = 'unchecked';
    }

    const nextStates = { ...checkboxStates };
    nextStates[node.id] = newState;

    const setChildrenState = (n: any, stateToSet: string) => {
      if (n.children && n.children.length > 0) {
        n.children.forEach((child: any) => {
          // On ne modifie l'état des enfants que s'ils ne sont pas supprimés
          if (!trashedStates[child.id]) {
            nextStates[child.id] = stateToSet;
            setChildrenState(child, stateToSet);
          }
        });
      }
    };

    setChildrenState(node, childState);
    setCheckboxStates(nextStates);
  };

  const updateRowTarget = (id: string, value: string) => {
    setRowTargets(prev => ({ ...prev, [id]: value }));
  };

  const handleTransferAll = () => {
    if (!globalTarget) return;

    const nextTargets = { ...rowTargets };

    Object.keys(checkboxStates).forEach(id => {
      // On s'assure de ne pas affecter de target aux lignes supprimées
      if (!trashedStates[id] && (checkboxStates[id] === 'checked' || checkboxStates[id] === 'indeterminate')) {
        nextTargets[id] = globalTarget;
      }
    });

    setRowTargets(nextTargets);
    setCheckboxStates({});
  };

  const handleReset = () => {
    setRowTargets({});
    setCheckboxStates({});
    // Optionnel : tu pourrais dé-supprimer tout le monde avec le reset.
    // setTrashedStates({});
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <Header
        leftIcon={<span className="font-semibold text-lg">Offboarding</span>}
        isPanelOpen={false}
        onTogglePanel={() => {}}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 sm:px-8 sm:py-16 flex flex-col gap-8">

        <div className="flex flex-wrap justify-between items-center gap-6 bg-white p-5 rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-72">
              <Select
                defaultValue="monsieur-blackhole"
                label="Select leaving user"
                options={[
                  { label: 'Sophie Vigier', value: 'sophie-vigier' },
                  { label: 'Grégoire Martinez', value: 'gregoire-martinez' },
                  { label: 'Monsieur Blackhole', value: 'monsieur-blackhole' }
                ]}
                searchable
              />
            </div>

            <div className="w-72">
              <Select
                label="Select target user"
                value={globalTarget || undefined}
                onChange={(v: any) => setGlobalTarget(extractValue(v))}
                options={[
                  { label: 'Sophie Vigier', value: 'sophie-vigier' },
                  { label: 'Grégoire Martinez', value: 'gregoire-martinez' },
                  { label: 'Monsieur Blackhole', value: 'monsieur-blackhole' }
                ]}
                searchable
              />
            </div>

            <Button
              icon={<ArrowLeftRight />}
              variant="primary"
              onClick={handleTransferAll}
            >
              Batch Apply
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              icon={<Retry />}
              variant="primary"
              color="warning"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button icon={<Send />} variant="primary" color="success">Send</Button>
          </div>
        </div>

        <div className="w-full bg-white rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
          <TreeContext.Provider value={{
            checkboxStates, toggleNode,
            rowTargets, updateRowTarget,
            trashedStates, toggleTrash
          }}>
            <Tree
              initialData={data}
              width="100%"
              height={600}
              rowHeight={64}
              indent={24}
            >
              {Node}
            </Tree>
          </TreeContext.Provider>
        </div>

      </main>

      <Footer
        externalLinks={[
          { href: "https://legifrance.gouv.fr/", label: "legifrance.gouv.fr" },
          { href: "https://info.gouv.fr/", label: "info.gouv.fr" },
          { href: "https://service-public.fr/", label: "service-public.fr" },
          { href: "https://data.gouv.fr/", label: "data.gouv.fr" },
        ]}
        legalLinks={[
          { href: "/legal-notice", label: "Legal Mentions" },
          { href: "/personal-data-cookies", label: "Personal Data and cookies" },
          { href: "/accessibility", label: "Accessibility: non-compliant" },
        ]}
        license={{
          label: "Unless otherwise stated, all content on this site is under",
          link: {
            href: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
            label: "licence etalab-2.0",
          },
        }}
      />
    </div>
  );
}
