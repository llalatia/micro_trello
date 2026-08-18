import React, { useState } from 'react';
import { ChecklistItem, UserRole } from '../types';
import { CheckSquare, Square, Plus, Trash2, Edit3, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface StepChecklistTreeProps {
  checklists: ChecklistItem[];
  onChangeChecklists: (updated: ChecklistItem[]) => void;
  userRole: UserRole;
  currentUserName: string;
  onLogAction?: (action: string, details?: string) => void;
  isReadOnly?: boolean;
}

export const StepChecklistTree: React.FC<StepChecklistTreeProps> = ({
  checklists,
  onChangeChecklists,
  userRole,
  currentUserName,
  onLogAction,
  isReadOnly = false,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [addingParentId, setAddingParentId] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const canEdit = !isReadOnly && (userRole === 'merch' || userRole === 'admin');

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper function to update item recursively
  const updateItemInList = (
    items: ChecklistItem[],
    targetId: string,
    updater: (item: ChecklistItem) => ChecklistItem
  ): ChecklistItem[] => {
    return items.map((item) => {
      if (item.id === targetId) {
        return updater(item);
      }
      if (item.subItems && item.subItems.length > 0) {
        return {
          ...item,
          subItems: updateItemInList(item.subItems, targetId, updater),
        };
      }
      return item;
    });
  };

  // Helper function to check if all subitems are completed
  const checkAutoParentCompletion = (items: ChecklistItem[]): ChecklistItem[] => {
    return items.map((item) => {
      let updatedItem = { ...item };
      if (updatedItem.subItems && updatedItem.subItems.length > 0) {
        const updatedSubs = checkAutoParentCompletion(updatedItem.subItems);
        const allSubsDone = updatedSubs.every((sub) => sub.completed);
        updatedItem = {
          ...updatedItem,
          subItems: updatedSubs,
          completed: allSubsDone,
        };
      }
      return updatedItem;
    });
  };

  const handleToggleComplete = (item: ChecklistItem) => {
    if (!canEdit) return;

    const nextCompleted = !item.completed;
    const nowIso = new Date().toISOString();

    const updated = updateItemInList(checklists, item.id, (curr) => {
      // Toggle current item
      const newItem = {
        ...curr,
        completed: nextCompleted,
        completedAt: nextCompleted ? nowIso : undefined,
        completedBy: nextCompleted ? currentUserName : undefined,
      };

      // If toggling parent, optionally toggle subitems to same state
      if (newItem.subItems && newItem.subItems.length > 0) {
        newItem.subItems = newItem.subItems.map((sub) => ({
          ...sub,
          completed: nextCompleted,
          completedAt: nextCompleted ? nowIso : undefined,
          completedBy: nextCompleted ? currentUserName : undefined,
        }));
      }

      return newItem;
    });

    const finalChecklists = checkAutoParentCompletion(updated);
    onChangeChecklists(finalChecklists);

    if (onLogAction) {
      const stateStr = nextCompleted ? 'Coché (fait)' : 'Décoché (à faire)';
      onLogAction(
        `Checklist: ${stateStr}`,
        `Tâche "${item.title}" marquée par ${currentUserName}`
      );
    }
  };

  const handleAddParentItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !canEdit) return;

    // Split by newlines so that pasting multi-line text creates multiple distinct items
    const lines = newTitle
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    const newItems: ChecklistItem[] = lines.map((line, index) => ({
      id: `chk-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      title: line,
      completed: false,
      subItems: [],
    }));

    const updated = [...checklists, ...newItems];
    onChangeChecklists(updated);
    setNewTitle('');

    if (onLogAction) {
      if (newItems.length === 1) {
        onLogAction('Ajout checklist', `Nouvelle tâche: "${newItems[0].title}"`);
      } else {
        onLogAction(
          'Ajout multiple checklists',
          `${newItems.length} tâches ajoutées: ${newItems.map((i) => `"${i.title}"`).join(', ')}`
        );
      }
    }
  };

  const handleAddSubItem = (parentId: string, parentTitle: string) => {
    if (!subTitle.trim() || !canEdit) return;

    const lines = subTitle
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    const newSubItems: ChecklistItem[] = lines.map((line, index) => ({
      id: `sub-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      title: line,
      completed: false,
    }));

    const updated = updateItemInList(checklists, parentId, (parent) => ({
      ...parent,
      subItems: [...(parent.subItems || []), ...newSubItems],
      completed: false, // Reopen parent if new subitem added
    }));

    onChangeChecklists(updated);
    setAddingParentId(null);
    setSubTitle('');
    setExpandedItems((prev) => ({ ...prev, [parentId]: true }));

    if (onLogAction) {
      if (newSubItems.length === 1) {
        onLogAction('Ajout sous-checklist', `Sous-tâche "${newSubItems[0].title}" ajoutée à "${parentTitle}"`);
      } else {
        onLogAction(
          'Ajout multiple sous-checklists',
          `${newSubItems.length} sous-tâches ajoutées à "${parentTitle}": ${newSubItems.map((i) => `"${i.title}"`).join(', ')}`
        );
      }
    }
  };

  const handleRenameItem = (id: string, oldTitle: string) => {
    if (!editingTitle.trim() || !canEdit) return;

    const updated = updateItemInList(checklists, id, (item) => ({
      ...item,
      title: editingTitle.trim(),
    }));

    onChangeChecklists(updated);
    setEditingId(null);
    setEditingTitle('');

    if (onLogAction) {
      onLogAction('Renommage checklist', `Tâche "${oldTitle}" renommée en "${editingTitle.trim()}"`);
    }
  };

  const removeItemFromList = (items: ChecklistItem[], targetId: string): ChecklistItem[] => {
    return items
      .filter((item) => item.id !== targetId)
      .map((item) => {
        if (item.subItems && item.subItems.length > 0) {
          return {
            ...item,
            subItems: removeItemFromList(item.subItems, targetId),
          };
        }
        return item;
      });
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (!canEdit) return;
    const updated = removeItemFromList(checklists, id);
    onChangeChecklists(updated);

    if (onLogAction) {
      onLogAction('Suppression checklist', `Tâche "${title}" supprimée`);
    }
  };

  // Helper to count total tasks vs done tasks
  const countStats = (items: ChecklistItem[]): { total: number; done: number } => {
    let total = 0;
    let done = 0;

    items.forEach((item) => {
      total += 1;
      if (item.completed) done += 1;

      if (item.subItems && item.subItems.length > 0) {
        const subStat = countStats(item.subItems);
        total += subStat.total;
        done += subStat.done;
      }
    });

    return { total, done };
  };

  const { total, done } = countStats(checklists);
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const renderItem = (item: ChecklistItem, depth = 0) => {
    const hasSub = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems[item.id] ?? true;
    const isEditing = editingId === item.id;

    return (
      <div key={item.id} className="group relative">
        <div
          className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border transition-all ${
            item.completed
              ? 'bg-emerald-50/50 border-emerald-200/60'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          } ${depth > 0 ? 'ml-6 border-l-2 border-l-indigo-300 bg-slate-50/50' : ''}`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {hasSub ? (
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : depth > 0 ? (
              <div className="w-4 h-4 flex items-center justify-center text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleToggleComplete(item)}
              disabled={!canEdit}
              className={`flex items-center justify-center shrink-0 w-5 h-5 rounded border transition-colors ${
                item.completed
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : canEdit
                  ? 'border-slate-300 text-transparent hover:border-indigo-500 bg-white'
                  : 'border-slate-200 bg-slate-100 cursor-not-allowed'
              }`}
            >
              {item.completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Square className="w-3.5 h-3.5" />}
            </button>

            {isEditing ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameItem(item.id, item.title);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-indigo-400 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleRenameItem(item.id, item.title)}
                  className="px-2 py-1 text-xs bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <span
                  onClick={() => handleToggleComplete(item)}
                  className={`text-sm select-none cursor-pointer font-medium transition-all block truncate ${
                    item.completed
                      ? 'line-through text-slate-400 opacity-75 font-normal'
                      : 'text-slate-800 hover:text-indigo-900'
                  }`}
                >
                  {item.title}
                </span>

                {item.completedAt && (
                  <span className="text-[11px] text-emerald-700/80 block mt-0.5">
                    Fait par {item.completedBy || 'Merch'} le {new Date(item.completedAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>
            )}
          </div>

          {canEdit && !isEditing && (
            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              {depth === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAddingParentId(item.id);
                    setSubTitle('');
                    setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
                  }}
                  title="Ajouter une sous-checklist"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setEditingTitle(item.title);
                }}
                title="Renommer"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteItem(item.id, item.title)}
                title="Supprimer"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Input box to add a sub-checklist item */}
        {addingParentId === item.id && canEdit && (
          <div className="ml-6 mt-1.5 p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-lg space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                <Plus className="w-3 h-3 text-indigo-600" /> Ajouter sous-tâche(s)
              </span>
              <span className="text-[10px] text-indigo-600/80">Collez plusieurs lignes pour créer plusieurs sous-tâches</span>
            </div>
            <div className="flex items-center gap-2">
              <textarea
                rows={subTitle.includes('\n') ? Math.min(4, subTitle.split('\n').length) : 1}
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text');
                  if (pasted.includes('\n')) {
                    // let standard paste update state or handle immediately
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddSubItem(item.id, item.title);
                  }
                  if (e.key === 'Escape') setAddingParentId(null);
                }}
                placeholder="Intitulé(s) de sous-tâche (ou collez plusieurs lignes)..."
                className="flex-1 px-2.5 py-1.5 text-xs border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleAddSubItem(item.id, item.title)}
                className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shrink-0"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setAddingParentId(null)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Render sub-checklist items recursively */}
        {hasSub && isExpanded && (
          <div className="mt-1.5 space-y-1.5">
            {item.subItems!.map((sub) => renderItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Progress Header */}
      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">
            Avancement des checklists: {done} / {total} réalisées
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-28">
          <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700 min-w-8 text-right">
            {percent}%
          </span>
        </div>
      </div>

      {/* List of Checklist items */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {checklists.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            Aucune checklist configurée pour cette étape.
          </p>
        ) : (
          checklists.map((item) => renderItem(item, 0))
        )}
      </div>

      {/* Form to add new primary Checklist item */}
      {canEdit && (
        <form onSubmit={handleAddParentItem} className="space-y-1.5 pt-1">
          <div className="flex gap-2 items-start">
            <textarea
              rows={newTitle.includes('\n') ? Math.min(5, newTitle.split('\n').length) : 1}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddParentItem(e);
                }
              }}
              placeholder="+ Ajouter une ou plusieurs checklists (collez une liste ligne par ligne)..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
            />
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {newTitle.trim().split(/\r?\n/).filter((l) => l.trim().length > 0).length > 1
                  ? `Ajouter (${newTitle.trim().split(/\r?\n/).filter((l) => l.trim().length > 0).length})`
                  : 'Ajouter'}
              </span>
            </button>
          </div>
          {newTitle.includes('\n') && (
            <p className="text-[11px] text-indigo-600 font-medium px-1">
              ✨ {newTitle.split(/\r?\n/).filter((l) => l.trim().length > 0).length} tâches distinctes seront créées automatiquement en un seul clic !
            </p>
          )}
        </form>
      )}

      {isReadOnly && (
        <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
          <span>ℹ️</span> Accès Client (lecture seule) : Vous pouvez visualiser le statut des checklists sans pouvoir cocher ou modifier.
        </p>
      )}
    </div>
  );
};
