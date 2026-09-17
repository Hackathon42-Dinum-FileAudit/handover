import { useState, createContext, useContext, useRef, useEffect, useMemo } from "react";
import { Tree } from "react-arborist";
import { Select, Button, Checkbox, FileIcon, Tooltip, Spinner, Badge } from "@gouvfr-lasuite/ui-components";
import { ArrowLeftRight, Trash, Undo, Retry, Send } from "@gouvfr-lasuite/ui-components/icons";

const TreeContext = createContext<any>(null);

// plan to retrieve available users via “account” in the future
const TARGET_OPTIONS = [
  { label: 'Line Manager (Auditor)', value: '021d6063-a251-472a-919e-325565b35c49' },
  { label: 'Alice Martin (Successor 1)', value: '2d915b4b-a763-4190-83a9-7380982d561e' },
  { label: 'Bob Dupont (Successor 2)', value: '2d915b4b-a763-4190-83a9-7380982d562e' },
  { label: 'Charlie Leroy (Successor 3)', value: '2d915b4b-a763-4190-83a9-7380982d563e' }
];

const getCookie = (name: string): string => {
  let cookieValue = '';
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'docx': case 'doc': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xlsx': case 'xls': case 'csv': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'pptx': case 'ppt': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    case 'gif': return 'image/gif';
    case 'mp3': case 'wav': return 'audio/mpeg';
    case 'mp4': case 'avi': return 'video/mp4';
    case 'zip': case 'rar': case '7z': case 'tar': case 'gz': return 'application/zip';
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

  const isSoleOwner = node.data.originalData?.is_sole_owner;

  const rowClasses = isTrashed
    ? "bg-zinc-100 opacity-50 grayscale dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 pointer-events-none"
    : "border-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 dark:border-zinc-800";

  const MAX_CHARS = 34;
  const isLong = node.data.label.length > MAX_CHARS;
  const displayLabel = isLong ? `${node.data.label.substring(0, MAX_CHARS)}...` : node.data.label;

  const labelElement = (
    <span className="block w-full font-medium text-zinc-800 dark:text-zinc-200 cursor-default">
      {displayLabel}
    </span>
  );

  const rawDate = node.data.originalData?.updated_at;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '--';

  return (
    <div style={style} className={`flex items-center gap-4 w-full pr-4 py-2.5 box-border border-b transition-all duration-200 ${rowClasses}`}>
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

      <div className="flex-1 min-w-0">
        {isLong ? (
          <Tooltip content={node.data.label} placement="bottom">{labelElement}</Tooltip>
        ) : (
          labelElement
        )}
      </div>

      <div className="w-36 flex-shrink-0 flex items-center">
        {isSoleOwner && <Badge uppercased type="warning">Sole owner</Badge>}
      </div>

      <div className="w-28 flex-shrink-0 text-sm text-zinc-500 dark:text-zinc-400 truncate">{formattedDate}</div>
      <div className={`w-48 sm:w-64 flex-shrink-0 flex items-center ${isTrashed ? 'pointer-events-none' : ''}`}>
        {/* plan to retrieve available users via “account” in the future */}
        <Select
          label="Select target user"
          options={TARGET_OPTIONS}
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

export default function AuditStep({ departingUserName, departingUserId, treeData, onFinish }: any) {
  const [globalTarget, setGlobalTarget] = useState("");
  const [checkboxStates, setCheckboxStates] = useState<Record<string, string>>({});
  const [rowTargets, setRowTargets] = useState<Record<string, string>>({});
  const [trashedStates, setTrashedStates] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [showOnlySoleOwner, setShowOnlySoleOwner] = useState(false);

  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const treeRef = useRef<any>(null);
  const [treeHeight, setTreeHeight] = useState(250);

  const nodeLookup = useMemo(() => {
    const map: Record<string, string> = {};
    const traverse = (nodes: any[]) => {
      nodes.forEach(n => {
        map[n.id] = n.label;
        if (n.children) traverse(n.children);
      });
    };
    traverse(treeData || []);
    return map;
  }, [treeData]);

  const itemPaths = useMemo(() => {
    const map: Record<string, string> = {};
    const traverse = (nodes: any[], currentPath: string) => {
      nodes.forEach(n => {
        const nodePath = currentPath ? `${currentPath} / ${n.label}` : n.label;
        map[n.id] = nodePath;
        if (n.children) traverse(n.children, nodePath);
      });
    };
    traverse(treeData || [], "");
    return map;
  }, [treeData]);

  const sortedTreeData = useMemo(() => {
    if (!treeData) return [];
    const sortNodes = (nodes: any[]): any[] => {
      return [...nodes].sort((a, b) => {
        if (sortBy === 'name') {
          const cmp = a.label.localeCompare(b.label);
          return sortOrder === 'asc' ? cmp : -cmp;
        } else {
          const dateA = a.originalData?.updated_at ? new Date(a.originalData.updated_at).getTime() : 0;
          const dateB = b.originalData?.updated_at ? new Date(b.originalData.updated_at).getTime() : 0;
          const cmp = dateA - dateB;
          return sortOrder === 'asc' ? cmp : -cmp;
        }
      }).map(n => ({
        ...n,
        children: n.children ? sortNodes(n.children) : undefined
      }));
    };
    return sortNodes(treeData);
  }, [treeData, sortBy, sortOrder]);

  const handleSort = (column: 'name' | 'date') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

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
  const ROW_HEIGHT = 76;

  const recalculateHeight = () => {
    setTimeout(() => {
      if (treeRef.current) {
        const newHeight = treeRef.current.visibleNodes.length * ROW_HEIGHT;
        setTreeHeight(newHeight > 0 ? newHeight : ROW_HEIGHT);
      }
    }, 10);
  };

  useEffect(() => { recalculateHeight(); }, [sortedTreeData]);

  const toggleTrash = (node: any) => {
    const willBeTrashed = !trashedStates[node.id];
    const nextTrashed = { ...trashedStates };
    const nextTargets = { ...rowTargets };
    const nextCheckboxes = { ...checkboxStates };

    const applyTrashToData = (dataNode: any) => {
      nextTrashed[dataNode.id] = willBeTrashed;
      if (willBeTrashed) {
        delete nextTargets[dataNode.id];
        nextCheckboxes[dataNode.id] = 'unchecked';
      }
      if (dataNode.children && dataNode.children.length > 0) {
        dataNode.children.forEach((child: any) => applyTrashToData(child));
      }
    };

    applyTrashToData(node.data);
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

    const setChildrenState = (dataNode: any, stateToSet: string) => {
      if (dataNode.children && dataNode.children.length > 0) {
        dataNode.children.forEach((child: any) => {
          if (!trashedStates[child.id]) {
            nextStates[child.id] = stateToSet;
            setChildrenState(child, stateToSet);
          }
        });
      }
    };

    setChildrenState(node.data, childState);
    setCheckboxStates(nextStates);
  };

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
    if (isAllExpanded) { treeRef.current.closeAll(); } else { treeRef.current.openAll(); }
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

  const handleSend = async () => {
    setIsSending(true);
    try {
      const transfersByRecipient: Record<string, string[]> = {};
      const trashedItemIds = Object.keys(trashedStates).filter(id => trashedStates[id]);

      Object.entries(rowTargets).forEach(([itemId, recipientId]) => {
        if (recipientId && !trashedStates[itemId]) {
          if (!transfersByRecipient[recipientId]) {
            transfersByRecipient[recipientId] = [];
          }
          transfersByRecipient[recipientId].push(itemId);
        }
      });

      const recipientIds = Object.keys(transfersByRecipient);

      if (recipientIds.length === 0 && trashedItemIds.length === 0) {
        alert("Please assign at least one file to a recipient or delete an item to validate the operation.");
        setIsSending(false);
        return;
      }

      const csrfToken = getCookie('csrftoken');
      const commonHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRFToken': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      };

      const transferPromises = recipientIds.map((recipientId) => {
        return fetch(`/api/v1.0/users/${departingUserId}/handover/transfer`, {
          method: 'POST',
          headers: commonHeaders,
          credentials: 'include',
          body: JSON.stringify({
            recipient_id: recipientId,
            item_ids: transfersByRecipient[recipientId],
            dry_run: false,
            reallocate_storage_quota: true
          })
        }).then(async (res) => {
          if (!res.ok) { return { ok: false }; }
          return { ok: true };
        });
      });

      const transferResults = await Promise.all(transferPromises);
      if (!transferResults.every(res => res.ok)) {
        throw new Error("Some transfers failed. Deletion was cancelled for security reasons.");
      }

      const deletePromises = trashedItemIds.map((itemId) => {
        return fetch(`/api/v1.0/users/${departingUserId}/handover/delete`, {
          method: 'DELETE',
          headers: commonHeaders,
          credentials: 'include',
          body: JSON.stringify({ item_id: itemId, title: nodeLookup[itemId] })
        }).then(async (res) => {
          if (!res.ok) {
            if (res.status === 404) return { ok: true };
            return { ok: false };
          }
          return { ok: true };
        });
      });

      const deleteResults = await Promise.all(deletePromises);
      if (!deleteResults.every(res => res.ok)) {
        throw new Error("Some deletion operations failed on the server side.");
      }

      const reportData = {
        date: new Date().toLocaleString("en-US"),
        auditorEmail: "manager@example.com",
        departingUserName: departingUserName,
        transfers: recipientIds.map(recipientId => ({
          recipientName: TARGET_OPTIONS.find(o => o.value === recipientId)?.label || recipientId,
          items: transfersByRecipient[recipientId].map(itemId => ({
            title: nodeLookup[itemId],
            path: itemPaths[itemId]
          }))
        })),
        deletions: trashedItemIds.map(itemId => ({
          title: nodeLookup[itemId],
          path: itemPaths[itemId]
        }))
      };

      onFinish(reportData);

    } catch (error) {
      console.error("Global sending error:", error);
      alert("An error occurred. Open the console (F12) to see Django error details.");
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      <div className="flex flex-wrap justify-between items-center gap-6 bg-white p-5 rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-6">
          <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded border border-zinc-200 dark:border-zinc-700 flex flex-col justify-center min-w-[200px]">
            <span className="text-xs text-zinc-500 uppercase font-semibold mb-1">Audited agent</span>
            <span className="font-medium text-zinc-900 dark:text-white">{departingUserName}</span>
          </div>

          <div className="w-72">
            {/* plan to retrieve available users via “account” in the future */}
            <Select
              label="Select target user"
              value={globalTarget || undefined}
              onChange={(v: any) => setGlobalTarget(extractValue(v))}
              options={TARGET_OPTIONS}
              searchable
            />
          </div>

          <Button icon={<ArrowLeftRight />} variant="primary" onClick={handleTransferAll}>Batch Apply</Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button icon={<Retry />} variant="primary" color="warning" onClick={handleReset} disabled={isSending}>Reset</Button>
          <Button icon={isSending ? <Spinner size="sm" /> : <Send />} variant="primary" color="success" onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>

      <div className="w-full bg-white rounded-lg shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-4 w-full pr-4 py-2.5 box-border bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center h-full">
            <button onClick={handleToggleExpandAll} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black cursor-pointer rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700">
              <span className="text-xs">{isAllExpanded ? '▼' : '▶'}</span>
            </button>
          </div>
          <div className="flex-shrink-0 flex items-center"><Checkbox checked={isAllChecked} indeterminate={isIndeterminate} onChange={handleToggleSelectAll} /></div>
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8"></div>

          <div className="flex-1 min-w-0">
            <button onClick={() => handleSort('name')} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${sortBy === 'name' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
              Name {sortBy === 'name' && (<svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>)}
            </button>
          </div>

          <label className="w-36 flex-shrink-0 flex items-center gap-2 cursor-pointer" title="Show only files without other owners">
            <Checkbox checked={showOnlySoleOwner} onChange={() => setShowOnlySoleOwner(!showOnlySoleOwner)} />
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Sole owner</span>
          </label>

          <div className="w-28 flex-shrink-0">
            <button onClick={() => handleSort('date')} className={`flex items-center gap-1 text-sm font-semibold transition-colors whitespace-nowrap ${sortBy === 'date' ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}>
              Last modified {sortBy === 'date' && (<svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>)}
            </button>
          </div>
          <div className="w-48 sm:w-64 flex-shrink-0 flex items-center"></div>
          <div className="flex-shrink-0 flex items-center opacity-0 pointer-events-none"><DeleteButton isTrashed={false} onToggle={() => {}} /></div>
        </div>

        <TreeContext.Provider value={{ checkboxStates, toggleNode, rowTargets, updateRowTarget, trashedStates, toggleTrash, recalculateHeight }}>
          <Tree
            ref={treeRef}
            data={sortedTreeData}
            width="100%"
            height={treeHeight}
            rowHeight={ROW_HEIGHT}
            indent={24}
            searchTerm={showOnlySoleOwner ? "sole_owner" : ""}
            searchMatch={(node, term) => {
              if (!term) return true;
              return node.data.originalData?.is_sole_owner === true;
            }}
          >
            {Node}
          </Tree>
        </TreeContext.Provider>
      </div>
    </div>
  );
}
