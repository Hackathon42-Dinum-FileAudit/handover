import { useState, createContext, useContext, useRef, useEffect, useMemo } from "react";
import { Tree } from "react-arborist";
import { Select, Button, Checkbox, FileIcon, Tooltip } from "@gouvfr-lasuite/ui-components";
import { ArrowLeftRight, Trash, Undo, Retry, Send } from "@gouvfr-lasuite/ui-components/icons";

const TreeContext = createContext<any>(null);

// --- HELPER : Déduire le MimeType depuis l'extension du fichier ---
const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'csv': return 'text/csv';
    case 'png': return 'image/png';
    case 'mp3': return 'audio/mpeg';
    case 'zip': return 'application/zip';
    case 'txt': return 'text/plain';
    default: return 'application/octet-stream';
  }
};

const extractValue = (v: any): string => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if ("value" in v) return v.value;
    if (v.target && "value" in v.target) return v.target.value;
  }
  return "";
};

function DeleteButton({ isTrashed, onToggle }: { isTrashed: boolean, onToggle: () => void }) {
  return (
    <Button aria-label={isTrashed ? "Restore" : "Delete"} icon={isTrashed ? <Undo /> : <Trash />} variant="primary" color={isTrashed ? "success" : "error"} onClick={onToggle} />
  );
}

function Node({ node, style }: any) {
  const {
    checkboxStates, toggleNode, rowTargets, updateRowTarget,
    trashedStates, toggleTrash, recalculateHeight
  } = useContext(TreeContext);

  const isTrashed = trashedStates[node.id] || false;
  const cbState = checkboxStates[node.id] || 'unchecked';
  const isChecked = cbState === 'checked' || cbState === 'indeterminate';
  const isIndeterminate = cbState === 'indeterminate';

  const isFolder = node.data.type === "folder" || node.isInternal;

  const fileMimeType = getMimeType(node.data.label);

  const rowClasses = isTrashed
    ? "bg-zinc-100 opacity-50 grayscale dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 pointer-events-none"
    : "border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-800";

  // --- TRONCATURE DU NOM ---
  const MAX_CHARS = 55;
  const isLong = node.data.label.length > MAX_CHARS;
  const displayLabel = isLong ? `${node.data.label.substring(0, MAX_CHARS)}...` : node.data.label;

  const labelElement = (
    <span className="block truncate font-medium text-zinc-800 dark:text-zinc-200 cursor-default">
      {displayLabel}
    </span>
  );

  // --- FORMATTAGE DE LA DATE COMPACTE ---
  const rawDate = node.data.originalData?.updated_at;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '--';

  return (
    <div style={style} className={`flex items-center gap-4 w-full pr-4 group min-w-0 border-b box-border transition-all duration-200 ${rowClasses}`}>
      <div className={`flex items-center h-full ${isTrashed ? 'pointer-events-auto' : ''}`} style={{ paddingLeft: `${node.level * 24}px` }}>
        {node.isInternal ? (
          <button onClick={(e) => { e.stopPropagation(); node.toggle(); recalculateHeight(); }} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700">
            <span className="text-xs">{node.isOpen ? '▼' : '▶'}</span>
          </button>
        ) : <span className="w-8 h-8"></span>}
      </div>

      <div className={`flex-shrink-0 flex items-center ${isTrashed ? 'pointer-events-none' : ''}`}>
        <Checkbox checked={isChecked} indeterminate={isIndeterminate} onChange={() => toggleNode(node)} disabled={isTrashed} />
      </div>

      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
        {isFolder ? (
          <svg className="w-7 h-7 text-zinc-400 dark:text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        ) : (
          <FileIcon file={{ title: node.data.label, mimetype: fileMimeType }} />
        )}
      </div>

      {/* --- COLONNE NOM --- */}
      <div className="flex-1 min-w-0">
        {isLong ? (
          <Tooltip content={node.data.label} placement="bottom">
            {labelElement}
          </Tooltip>
        ) : (
          labelElement
        )}
      </div>

      {/* --- COLONNE DATE COMPACTE --- */}
      <div className="w-28 flex-shrink-0 text-sm text-zinc-500 dark:text-zinc-400 truncate">
        {formattedDate}
      </div>

      {/* --- COLONNE ACTIONS --- */}
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
        <DeleteButton isTrashed={isTrashed} onToggle={() => toggleTrash(node)} />
      </div>
    </div>
  );
}

export default function AuditStep({ departingUserName, treeData, onFinish }: any) {
  const [globalTarget, setGlobalTarget] = useState("");
  const [checkboxStates, setCheckboxStates] = useState<Record<string, string>>({});
  const [rowTargets, setRowTargets] = useState<Record<string, string>>({});
  const [trashedStates, setTrashedStates] = useState<Record<string, boolean>>({});

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const treeRef = useRef<any>(null);
  const [treeHeight, setTreeHeight] = useState(200);

  // --- LOGIQUE DE TRI ALPHABÉTIQUE ---
  const sortedTreeData = useMemo(() => {
    if (!treeData) return [];
    const sortNodes = (nodes: any[]): any[] => {
      return [...nodes].sort((a, b) => {
        const cmp = a.label.localeCompare(b.label);
        return sortOrder === 'asc' ? cmp : -cmp;
      }).map(n => ({
        ...n,
        children: n.children ? sortNodes(n.children) : undefined
      }));
    };
    return sortNodes(treeData);
  }, [treeData, sortOrder]);

  // --- ÉTAT DE LA CHECKBOX GLOBALE ---
  const totalSelectableNodes = useMemo(() => {
    const countNodes = (nodes: any[]): number => {
      return nodes.reduce((acc, node) => acc + 1 + (node.children ? countNodes(node.children) : 0), 0);
    };
    return countNodes(treeData || []);
  }, [treeData]);

  const checkedCount = Object.values(checkboxStates).filter(v => v === 'checked').length;
  const validNodesCount = totalSelectableNodes - Object.values(trashedStates).filter(Boolean).length;
  const isAllChecked = validNodesCount > 0 && checkedCount >= validNodesCount;
  const isIndeterminate = checkedCount > 0 && !isAllChecked;

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
  }, [sortedTreeData]);

  const toggleTrash = (node: any) => {
    const willBeTrashed = !trashedStates[node.id];
    const nextTrashed = { ...trashedStates };
    const nextTargets = { ...rowTargets };
    const nextCheckboxes = { ...checkboxStates };

    const applyTrashToNodeAndChildren = (n: any) => {
      nextTrashed[n.id] = willBeTrashed;
      if (willBeTrashed) { delete nextTargets[n.id]; nextCheckboxes[n.id] = 'unchecked'; }
      if (n.children && n.children.length > 0) { n.children.forEach((child: any) => applyTrashToNodeAndChildren(child)); }
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

    if (currentState === 'unchecked') { newState = 'checked'; childState = 'indeterminate'; }
    else if (currentState === 'checked') { newState = 'unchecked'; childState = 'unchecked'; }
    else if (currentState === 'indeterminate') { newState = 'unchecked'; childState = 'unchecked'; }

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

  // --- SÉLECTION GLOBALE ---
  const handleToggleSelectAll = () => {
    if (isAllChecked) {
      setCheckboxStates({});
    } else {
      const nextStates: Record<string, string> = {};
      const selectAll = (nodes: any[]) => {
        nodes.forEach(n => {
          if (!trashedStates[n.id]) nextStates[n.id] = 'checked';
          if (n.children) selectAll(n.children);
        });
      };
      selectAll(treeData || []);
      setCheckboxStates(nextStates);
    }
  };

  const handleToggleExpandAll = () => {
    if (!treeRef.current) return;
    if (isAllExpanded) {
      treeRef.current.closeAll();
    } else {
      treeRef.current.openAll();
    }
    setIsAllExpanded(!isAllExpanded);
    recalculateHeight();
  };

  const updateRowTarget = (id: string, value: string) => setRowTargets(prev => ({ ...prev, [id]: value }));

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
    setGlobalTarget("");
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-6 bg-white p-5 rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-6">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded border border-zinc-200 dark:border-zinc-700 flex flex-col justify-center min-w-[200px]">
            <span className="text-xs text-zinc-500 uppercase font-semibold mb-1">Agent audité</span>
            <span className="font-medium text-zinc-900 dark:text-white">{departingUserName}</span>
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

          <Button icon={<ArrowLeftRight />} variant="primary" onClick={handleTransferAll}>Batch Apply</Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button icon={<Retry />} variant="primary" color="warning" onClick={handleReset}>Reset</Button>
          <Button icon={<Send />} variant="primary" color="success" onClick={onFinish}>Send</Button>
        </div>
      </div>

      <div className="w-full bg-white rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">

        {/* --- HEADER ALIGNÉ EXACTEMENT SUR LA GRILLE DU TREE --- */}
        {/* Changement : py-1.5 pour réduire la hauteur globale de la barre */}
        <div className="flex items-center gap-4 w-full pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">

          {/* 1. Chevron global */}
          <div className="flex items-center h-full">
            <button
              onClick={handleToggleExpandAll}
              className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
              title={isAllExpanded ? "Tout replier" : "Tout déplier"}
            >
              <span className="text-xs">{isAllExpanded ? '▼' : '▶'}</span>
            </button>
          </div>

          {/* 2. Checkbox globale */}
          <div className="flex-shrink-0 flex items-center">
            <Checkbox
              checked={isAllChecked}
              indeterminate={isIndeterminate}
              onChange={handleToggleSelectAll}
            />
          </div>

          {/* 3. Espaceur pour l'icône de fichier */}
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8"></div>

          {/* 4. En-tête : Name */}
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Name
              <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            </button>
          </div>

          {/* 5. En-tête : Last modified */}
          <div className="w-28 flex-shrink-0">
            {/* Changement : gap-1, whitespace-nowrap et suppression du SVG de l'horloge */}
            <button className="flex items-center gap-1 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Last modified
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            </button>
          </div>

          {/* 6. Espaceur pour Select Target */}
          <div className="w-48 sm:w-64 flex-shrink-0 flex items-center"></div>

          {/* 7. Espaceur pour Corbeille (Invisible pour garder l'alignement de fin de ligne) */}
          <div className="flex-shrink-0 flex items-center opacity-0 pointer-events-none">
             <DeleteButton isTrashed={false} onToggle={() => {}} />
          </div>

        </div>

        {/* TREE COMPONENT */}
        <TreeContext.Provider value={{ checkboxStates, toggleNode, rowTargets, updateRowTarget, trashedStates, toggleTrash, recalculateHeight }}>
          <Tree ref={treeRef} data={sortedTreeData} width="100%" height={treeHeight} rowHeight={64} indent={24}>
            {Node}
          </Tree>
        </TreeContext.Provider>

      </div>
    </div>
  );
}
