"use client";
import { useState, createContext, useContext, useRef, useEffect } from "react";
import { Tree } from "react-arborist";

// UI-kit Components
import { Footer } from "@gouvfr-lasuite/ui-components";
import { Header } from "@gouvfr-lasuite/ui-components";
import { Select } from "@gouvfr-lasuite/ui-components";
import { Button } from "@gouvfr-lasuite/ui-components";
// Ajout de FileIcon dans les imports
import { Checkbox, FileIcon } from "@gouvfr-lasuite/ui-components";

// UI-kit Icons
import { ArrowLeftRight } from "@gouvfr-lasuite/ui-components/icons";
import { Trash } from "@gouvfr-lasuite/ui-components/icons";
import { Undo } from "@gouvfr-lasuite/ui-components/icons";
import { Retry } from "@gouvfr-lasuite/ui-components/icons";
import { Send } from "@gouvfr-lasuite/ui-components/icons";

// Data
// J'ai mis à jour les données avec de vrais fichiers et des mimetypes pour tester les icônes
const data = [
  {
    id: "1",
    label: "Dossier A",
    type: "folder", // <-- Indication explicite
    children: [
      { id: "1-1", label: "report.pdf", mimetype: "application/pdf" },
      { id: "1-2", label: "budget.calc", mimetype: "application/vnd.oasis.opendocument.spreadsheet" },
    ],
  },
  {
    id: "2",
    label: "Dossier B",
    type: "folder", // <-- Même sans enfants, c'est un dossier
    children: [] // Bonne pratique pour Arborist
  },
  {
    id: "3",
    label: "Dossier C",
    type: "folder", // <-- Indication explicite
    children: [
      { id: "3-1", label: "presentation.pptx", mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
      { id: "3-2",
        label: "Dossier C-1",
        type: "folder",
        children: [
          { id: "3-2-1", label: "data.csv", mimetype: "text/csv" },
          { id: "3-2-2", label: "archive.zip", mimetype: "application/zip" },
        ],
      },
      { id: "3-3",
        label: "Dossier C-2",
        type: "folder",
        children: [
          { id: "3-3-1", label: "photo.jpg", mimetype: "image/jpeg" },
          { id: "3-3-2", label: "audio.mp3", mimetype: "audio/mpeg" },
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
    toggleTrash,
    recalculateHeight
  } = useContext(TreeContext);

  const isTrashed = trashedStates[node.id] || false;
  const cbState = checkboxStates[node.id] || 'unchecked';

  const isChecked = cbState === 'checked' || cbState === 'indeterminate';
  const isIndeterminate = cbState === 'indeterminate';

  const rowClasses = isTrashed
    ? "bg-zinc-100 opacity-50 grayscale dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 pointer-events-none"
    : "border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-800";

  return (
    <div
      style={style}
      className={`flex items-center gap-4 w-full pr-4 group min-w-0 border-b box-border transition-all duration-200 ${rowClasses}`}
    >
      <div
        className={`flex items-center h-full ${isTrashed ? 'pointer-events-auto' : ''}`}
        style={{ paddingLeft: `${node.level * 24}px` }}
      >
        {node.isInternal ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              node.toggle();
              recalculateHeight();
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
          disabled={isTrashed}
        />
      </div>

      {/* --- NOUVEAU BLOC : ICÔNES --- */}
      <div className="flex-shrink-0 flex items-center">
        {node.isInternal ? (
          // Icône de dossier générique (SVG) pour les nœuds parents
          <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        ) : (
          // Icône de fichier (FileIcon de Cunningham) pour les fichiers finaux
          <FileIcon
            file={{
              title: node.data.label,
              mimetype: node.data.mimetype || "application/octet-stream"
            }}
            type="mini"
            size="small"
          />
        )}
      </div>
      {/* ------------------------------ */}

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
          disabled={isTrashed}
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

  const treeRef = useRef<any>(null);
  const [treeHeight, setTreeHeight] = useState(200);

  const recalculateHeight = () => {
    setTimeout(() => {
      if (treeRef.current) {
        const newHeight = treeRef.current.visibleNodes.length * 64;
        setTreeHeight(newHeight > 0 ? newHeight : 64);
      }
    }, 10);
  };

  useEffect(() => {
    recalculateHeight();
  }, []);

  const toggleTrash = (node: any) => {
    const willBeTrashed = !trashedStates[node.id];

    const nextTrashed = { ...trashedStates };
    const nextTargets = { ...rowTargets };
    const nextCheckboxes = { ...checkboxStates };

    const applyTrashToNodeAndChildren = (n: any) => {
      nextTrashed[n.id] = willBeTrashed;

      if (willBeTrashed) {
        delete nextTargets[n.id];
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

  const toggleNode = (node: any) => {
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
    setTrashedStates({});
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

        <div className="w-full bg-white rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <TreeContext.Provider value={{
            checkboxStates, toggleNode,
            rowTargets, updateRowTarget,
            trashedStates, toggleTrash,
            recalculateHeight
          }}>
            <Tree
              ref={treeRef}
              initialData={data}
              width="100%"
              height={treeHeight}
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
