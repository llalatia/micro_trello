import React, { useState } from 'react';
import { InteractiveCommentsSection } from './InteractiveCommentsSection';
import { RichTextEditor } from './RichTextEditor';
import { FormattedText } from './FormattedText';
import {
  Card,
  StepDefinition,
  UserRole,
  UserProfile,
  CardAttachment,
  CardMember,
  ChecklistItem,
  CardComment,
  CardLabel,
  CardMerchandiser,
  InvitedVisitor,
} from '../types';
import {
  canUserCreateOrEditCards,
  isRespPointClients,
  isVisiteur,
  canAssignMerchandisers,
  canInviteVisitors,
  canRemoveVisitors,
} from '../utils/permissions';
import { getCardMerchandisers } from '../utils/merchandiser';
import {
  X,
  FileText,
  Image as ImageIcon,
  Users,
  Clock,
  CheckSquare,
  Paperclip,
  Upload,
  UserPlus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Package,
  Eye,
  Save,
  CheckCircle2,
  MessageSquare,
  Send,
  Tag,
  UserCheck,
  Mail,
  Shield,
  ShieldAlert,
  UserMinus,
  Check,
  AlertCircle,
} from 'lucide-react';
import { StepChecklistTree } from './StepChecklistTree';
import { HistoryLogTable } from './HistoryLogTable';
import { FileViewerModal } from './FileViewerModal';
import { LabelSelectorPopover } from './LabelSelectorPopover';
import { DEFAULT_LABELS } from '../data/defaultLabels';

interface CardIdentityModalProps {
  card: Card;
  steps: StepDefinition[];
  allUsers: UserProfile[];
  currentUser: UserProfile;
  onClose: () => void;
  onUpdateCard: (updated: Card) => void;
  onInviteVisitorUser?: (cardId: string, email: string, name?: string) => void;
  onRemoveVisitorUser?: (cardId: string, email: string) => void;
}

export const CardIdentityModal: React.FC<CardIdentityModalProps> = ({
  card,
  steps,
  allUsers,
  currentUser,
  onClose,
  onUpdateCard,
  onInviteVisitorUser,
  onRemoveVisitorUser,
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'checklists' | 'attachments' | 'members' | 'history'>('identity');
  const [viewingAttachment, setViewingAttachment] = useState<CardAttachment | null>(null);

  const isClient = currentUser.role === 'client';
  const isUserVisiteur = isVisiteur(currentUser);
  const canEdit = canUserCreateOrEditCards(currentUser);
  const canAssignMerchs = canAssignMerchandisers(currentUser);
  const canInvite = canInviteVisitors(currentUser);
  const canRemove = canRemoveVisitors(currentUser);
  const isPointClients = isRespPointClients(currentUser);

  // Form state for specs
  const [modele, setModele] = useState(card.modele);
  const [reference, setReference] = useState(card.reference);
  const [clientName, setClientName] = useState(card.clientName);
  const [matiere, setMatiere] = useState(card.descriptionSpec.matiere);
  const [prix, setPrix] = useState(card.descriptionSpec.prix);
  const [quantites, setQuantites] = useState(card.descriptionSpec.quantites);
  const [historiqueNote, setHistoriqueNote] = useState(card.descriptionSpec.historiqueNote || '');
  const [dateLivraison, setDateLivraison] = useState(card.dateLivraison.slice(0, 10));

  // Merchandiser / Commercial(e) en charge state (Multi-merchandisers support)
  const initialMerchs = getCardMerchandisers(card, allUsers);
  const [selectedMerchandiserIds, setSelectedMerchandiserIds] = useState<string[]>(
    initialMerchs.map((m) => m.id).filter(Boolean) as string[]
  );
  const [merchandiserName, setMerchandiserName] = useState(
    initialMerchs.map((m) => m.name).join(', ')
  );
  const [merchandiserId, setMerchandiserId] = useState(initialMerchs[0]?.id || '');

  // Member selection state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState<UserRole>('merch');

  // Visitor Invitation state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteErrorMsg, setInviteErrorMsg] = useState<string | null>(null);

  // Selected step checklist tab view inside card modal
  const [selectedStepIdForChecklists, setSelectedStepIdForChecklists] = useState(card.currentStepId);

  // Labels popover state
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<CardLabel[]>(DEFAULT_LABELS);

  // Parse various date strings safely into a Date object
  const parseTimestampToDate = (ts: string): Date => {
    if (!ts) return new Date(0);
    if (ts.includes('T')) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
    // Handles "DD/MM/YYYY à HH:mm:ss" or "DD/MM/YYYY à HH:mm"
    const match = ts.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+à\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (match) {
      const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match;
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
    }
    const isoMatch = ts.match(/(\d{4})-(\d{2})-(\d{2})(?:\s+à\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (isoMatch) {
      const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = isoMatch;
      return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
    }
    const parsed = new Date(ts);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  };

  // Generate dynamic human-readable relative timestamp
  const getDynamicTimestampLabel = (rawTs: string): string => {
    const dateObj = parseTimestampToDate(rawTs);
    if (dateObj.getTime() === 0) return rawTs;

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();

    if (diffMs < 0 || diffMs < 30 * 1000) {
      return "À l'instant";
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }

    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Toggle label handler
  const handleToggleLabel = (targetLabel: CardLabel) => {
    const currentLabels = card.labels || [];
    const exists = currentLabels.some((l) => l.id === targetLabel.id);
    const newLabels = exists
      ? currentLabels.filter((l) => l.id !== targetLabel.id)
      : [...currentLabels, targetLabel];

    const actionName = exists
      ? `Retrait étiquette: "${targetLabel.name}"`
      : `Ajout étiquette: "${targetLabel.name}"`;

    const updatedLogs = logAction('Étiquettes / Labels', actionName);

    onUpdateCard({
      ...card,
      labels: newLabels,
      historyLogs: updatedLogs,
    });
  };

  const currentStep = steps.find((s) => s.id === card.currentStepId) || steps[0];

  // Utility to log modification action
  const logAction = (action: string, details?: string) => {
    const newLog = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cardId: card.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    return [newLog, ...card.historyLogs];
  };

  // Step change handler
  const handleStepChange = (newStepId: string) => {
    if (!canEdit || newStepId === card.currentStepId) return;

    const oldStep = steps.find((s) => s.id === card.currentStepId)?.name || card.currentStepId;
    const newStep = steps.find((s) => s.id === newStepId)?.name || newStepId;

    const updatedLogs = logAction(
      `Changement d'étape: ${oldStep} → ${newStep}`,
      `Carte déplacée de "${oldStep}" vers "${newStep}"`
    );

    const updatedCard: Card = {
      ...card,
      currentStepId: newStepId,
      status: 'en_cours',
      historyLogs: updatedLogs,
    };

    onUpdateCard(updatedCard);
    setSelectedStepIdForChecklists(newStepId);
  };

  // Save specs handler
  const handleSaveSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    // Build the list of merchandisers from selected IDs or fallback
    const selectedMerchUsers = allUsers.filter((u) => selectedMerchandiserIds.includes(u.id));
    const newMerchandisersList: CardMerchandiser[] =
      selectedMerchUsers.length > 0
        ? selectedMerchUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            posteLabel: u.posteLabel || (u.role === 'merch' ? 'Commerciale / Merchandiser' : undefined),
          }))
        : [
            {
              id: merchandiserId || 'merch-default',
              name: merchandiserName || 'Équipe Commerciale',
              avatar: allUsers.find((u) => u.id === merchandiserId)?.avatar || card.merchandiserAvatar,
            },
          ];

    const primaryMerch = newMerchandisersList[0];
    const combinedNames = newMerchandisersList.map((m) => m.name).join(', ');

    // Ensure all merchandisers are synced in members list
    let updatedMembers = [...card.members];
    newMerchandisersList.forEach((merch) => {
      const existingIndex = updatedMembers.findIndex(
        (m) => (merch.id && m.id === merch.id) || m.name.toLowerCase() === merch.name.toLowerCase()
      );
      const newMerchMember: CardMember = {
        id: merch.id || `member-${Date.now()}`,
        name: merch.name,
        email: merch.email || '',
        role: 'merch',
        avatar: merch.avatar,
        addedAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        updatedMembers[existingIndex] = { ...updatedMembers[existingIndex], role: 'merch' };
      } else {
        updatedMembers.push(newMerchMember);
      }
    });

    const updatedLogs = logAction(
      'Mise à jour Fiche Identitaire',
      `Spécifications modifiées: Modèle=${modele}, Commerciales=${combinedNames}, Matière=${matiere}, Prix=${prix}€, Qté=${quantites}`
    );

    const updatedCard: Card = {
      ...card,
      reference,
      modele,
      clientName,
      dateLivraison: new Date(dateLivraison).toISOString(),
      descriptionSpec: {
        modele,
        matiere,
        prix: Number(prix),
        quantites: Number(quantites),
        historiqueNote,
      },
      merchandiserName: combinedNames,
      merchandiserId: primaryMerch?.id || merchandiserId,
      merchandiserAvatar: primaryMerch?.avatar || card.merchandiserAvatar,
      merchandisers: newMerchandisersList,
      members: updatedMembers,
      historyLogs: updatedLogs,
    };

    onUpdateCard(updatedCard);
  };

  // Upload handler for Dossier Technique (PDF), Frame (Photo), or Attachment
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: 'dossier_technique' | 'frame' | 'attachement'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !canEdit) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ce fichier dépasse la taille maximale recommandée (15 Mo). Veuillez sélectionner un fichier PDF plus léger.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target?.result as string;

      const newAttachment: CardAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        fileUrl: fileDataUrl,
        mimeType: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        category,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
      };

      let updatedCard: Card = { ...card };
      let actionName = '';

      if (category === 'dossier_technique') {
        actionName = 'Mise à jour Dossier Technique (PDF)';
        updatedCard.dossierTechnique = newAttachment;
      } else if (category === 'frame') {
        actionName = 'Mise à jour Photo / Frame';
        updatedCard.frame = newAttachment;
      } else {
        actionName = `Ajout d'attachement (${file.name})`;
        updatedCard.attachments = [...card.attachments, newAttachment];
      }

      const updatedLogs = logAction(actionName, `Fichier "${file.name}" importé`);
      updatedCard.historyLogs = updatedLogs;

      onUpdateCard(updatedCard);
    };

    reader.readAsDataURL(file);
    e.target.value = ''; // reset input
  };

  // Remove attachment handler
  const handleRemoveAttachment = (attachmentId: string, category: string, name: string) => {
    if (!canEdit) return;

    let updatedCard: Card = { ...card };

    if (category === 'dossier_technique') {
      updatedCard.dossierTechnique = null;
    } else if (category === 'frame') {
      updatedCard.frame = null;
    } else {
      updatedCard.attachments = card.attachments.filter((a) => a.id !== attachmentId);
    }

    const updatedLogs = logAction(`Suppression fichier`, `Fichier "${name}" retiré`);
    updatedCard.historyLogs = updatedLogs;

    onUpdateCard(updatedCard);
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !canEdit) return;

    const userObj = allUsers.find((u) => u.id === selectedUserId);
    if (!userObj) return;

    if (card.members.some((m) => m.id === userObj.id)) {
      alert('Ce membre est déjà associé à la carte.');
      return;
    }

    const newMember: CardMember = {
      id: userObj.id,
      name: userObj.name,
      email: userObj.email,
      role: selectedMemberRole,
      avatar: userObj.avatar,
      addedAt: new Date().toISOString(),
    };

    const updatedLogs = logAction(
      `Ajout membre (${selectedMemberRole.toUpperCase()})`,
      `${userObj.name} ajouté avec le rôle ${selectedMemberRole}`
    );

    const updatedCard: Card = {
      ...card,
      members: [...card.members, newMember],
      historyLogs: updatedLogs,
    };

    onUpdateCard(updatedCard);
    setSelectedUserId('');
  };

  // Remove Member
  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (!canEdit) return;

    const updatedMembers = card.members.filter((m) => m.id !== memberId);
    const updatedLogs = logAction('Retrait membre', `${memberName} retiré de la carte`);

    onUpdateCard({
      ...card,
      members: updatedMembers,
      historyLogs: updatedLogs,
    });
  };

  // Invite Visitor (Exclusivité Resp Point Clients & Admin)
  const handleInviteVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteErrorMsg(null);
    setInviteSuccessMsg(null);

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteErrorMsg('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    const normalizedEmail = inviteEmail.trim().toLowerCase();
    const existingVisitors = card.invitedVisitors || [];

    if (existingVisitors.some((v) => v.email.toLowerCase() === normalizedEmail)) {
      setInviteErrorMsg('Cette adresse e-mail est déjà invitée sur cette carte.');
      return;
    }

    const visitorName = inviteName.trim() || inviteEmail.split('@')[0];
    const newVisitor: InvitedVisitor = {
      id: `vis-${Date.now()}`,
      email: normalizedEmail,
      name: visitorName,
      avatar: `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(visitorName)}&eyes=variant08&hair=variant14`,
      invitedAt: new Date().toISOString(),
      invitedBy: currentUser.name + (currentUser.posteLabel ? ` (${currentUser.posteLabel})` : ''),
      invitedById: currentUser.id,
      notes: inviteNotes.trim() || undefined,
    };

    const updatedVisitors = [...existingVisitors, newVisitor];
    const updatedLogs = logAction(
      'Invitation Visiteur Observateur',
      `Visiteur "${visitorName}" (${normalizedEmail}) invité en observation par ${currentUser.name}`
    );

    const updatedCard: Card = {
      ...card,
      invitedVisitors: updatedVisitors,
      historyLogs: updatedLogs,
    };

    onUpdateCard(updatedCard);
    onInviteVisitorUser?.(card.id, normalizedEmail, visitorName);

    setInviteEmail('');
    setInviteName('');
    setInviteNotes('');
    setInviteSuccessMsg(`Invitation envoyée avec succès à ${normalizedEmail} !`);
    setTimeout(() => setInviteSuccessMsg(null), 5000);
  };

  // Remove / Revoke Visitor (Exclusivité Resp Point Clients & Admin)
  const handleRemoveVisitor = (visitorEmail: string, visitorName?: string) => {
    if (!canRemove) return;
    if (
      !confirm(
        `Êtes-vous sûr de vouloir retirer définitivement l'accès observateur à ${visitorName || visitorEmail} ?`
      )
    ) {
      return;
    }

    const updatedVisitors = (card.invitedVisitors || []).filter(
      (v) => v.email.toLowerCase() !== visitorEmail.toLowerCase()
    );
    const updatedLogs = logAction(
      'Révocation Visiteur Observateur',
      `Accès observateur de ${visitorName || visitorEmail} révoqué par ${currentUser.name}`
    );

    const updatedCard: Card = {
      ...card,
      invitedVisitors: updatedVisitors,
      historyLogs: updatedLogs,
    };

    onUpdateCard(updatedCard);
    onRemoveVisitorUser?.(card.id, visitorEmail);
  };

  // Update Checklist items for step
  const handleChecklistsChange = (stepId: string, updatedChecklists: ChecklistItem[]) => {
    const updatedStepChecklists = {
      ...card.stepChecklists,
      [stepId]: updatedChecklists,
    };

    onUpdateCard({
      ...card,
      stepChecklists: updatedStepChecklists,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
          {/* Top Identity Header Banner */}
          {isUserVisiteur && (
            <div className="bg-amber-600/90 text-amber-50 px-5 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 border-b border-amber-500/40">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-200 shrink-0" />
                <span>
                  <strong>Accès Visiteur Observateur (Lecture Seule)</strong> — Vous êtes invité à observer uniquement cette carte. Aucune modification n'est autorisée.
                </span>
              </div>
              <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded font-mono">
                {card.reference}
              </span>
            </div>
          )}

          <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-400/30">
                  {card.reference}
                </span>

                <span className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${currentStep.color}`}>
                  Étape: {currentStep.name}
                </span>

                <span className="text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1">
                  <UserPlus className="w-3 h-3 text-slate-400" />
                  Client: <strong className="text-white">{card.clientName}</strong>
                </span>

                {/* Multiple Merchandisers Banner in modal header */}
                <div className="text-xs text-slate-300 bg-slate-800/95 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="text-slate-400">Commerciale(s):</span>
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    {initialMerchs.map((m, idx) =>
                      m.avatar ? (
                        <img
                          key={m.id || idx}
                          src={m.avatar}
                          alt={m.name}
                          className="w-4 h-4 rounded-full object-cover border border-slate-900"
                        />
                      ) : (
                        <div
                          key={m.id || idx}
                          className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[7.5px] flex items-center justify-center border border-slate-900"
                        >
                          {m.name.charAt(0)}
                        </div>
                      )
                    )}
                  </div>
                  <strong className="text-white truncate max-w-[200px]">
                    {initialMerchs.map((m) => m.name.split(' ')[0]).join(', ')}
                  </strong>
                </div>

                {/* Invited visitors count in header */}
                {card.invitedVisitors && card.invitedVisitors.length > 0 && (
                  <span className="text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-700/50 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-amber-400" />
                    {card.invitedVisitors.length} visiteur(s) invité(s)
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                {card.modele}
              </h2>

              {/* Trello-like Labels bar */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {card.labels && card.labels.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {card.labels.map((lbl) => (
                      <span
                        key={lbl.id}
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs border ${lbl.badgeClass}`}
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                )}

                {canEdit && (
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setIsLabelPopoverOpen((prev) => !prev)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Étiquettes</span>
                      {card.labels && card.labels.length > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-0.5">
                          {card.labels.length}
                        </span>
                      )}
                    </button>

                    {isLabelPopoverOpen && (
                      <LabelSelectorPopover
                        cardLabels={card.labels || []}
                        onToggleLabel={handleToggleLabel}
                        onClose={() => setIsLabelPopoverOpen(false)}
                        availableLabels={availableLabels}
                        onUpdateAvailableLabels={setAvailableLabels}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Quick Step Changer dropdown */}
              {canEdit && (
                <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                  <Layers className="w-4 h-4 text-indigo-400 ml-1" />
                  <select
                    value={card.currentStepId}
                    onChange={(e) => handleStepChange(e.target.value)}
                    className="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    {steps.map((s) => (
                      <option key={s.id} value={s.id}>
                        Step {s.order}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('identity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'identity'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Info className="w-4 h-4 text-indigo-600" />
              Fiche Identitaire & Spécifications
            </button>

            <button
              onClick={() => setActiveTab('checklists')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'checklists'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Checklists par Étape
            </button>

            <button
              onClick={() => setActiveTab('attachments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'attachments'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Paperclip className="w-4 h-4 text-amber-600" />
              Dossier Tech & Médias ({ (card.dossierTechnique ? 1 : 0) + (card.frame ? 1 : 0) + card.attachments.length })
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-blue-600" />
              Membres & Visiteurs ({card.members.length + (card.invitedVisitors?.length || 0)})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-4 h-4 text-violet-600" />
              Historique des Modifications ({card.historyLogs.length})
            </button>
          </div>

          {/* Modal Main Content */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-slate-50/40">
            {/* TAB 1: IDENTITY & SPECIFICATIONS */}
            {activeTab === 'identity' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveSpecs} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Merchandisers + Frame/Photo + Dossier Technique Quick Card */}
                  <div className="space-y-4">
                    {/* Commercial(e)s / Merchandisers Responsables (2 à 4 Merchs) */}
                    <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          Commercial(e)s Responsables (2 à 4 Merchs)
                        </label>
                        <div className="flex items-center gap-1.5">
                          {canAssignMerchs && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              Privilège Resp Point Clients
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                            {selectedMerchandiserIds.length} sélectionnée(s)
                          </span>
                        </div>
                      </div>

                      {canEdit ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-slate-600">
                            Cochez les commerciales en charge de ce modèle (2 à 4 responsables recommandées) :
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allUsers
                              .filter((u) => u.role === 'merch' || u.role === 'admin' || u.role === 'resp_point_clients')
                              .map((u) => {
                                const isSelected = selectedMerchandiserIds.includes(u.id);
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        if (selectedMerchandiserIds.length > 1) {
                                          setSelectedMerchandiserIds(selectedMerchandiserIds.filter((id) => id !== u.id));
                                        }
                                      } else {
                                        if (selectedMerchandiserIds.length < 4) {
                                          setSelectedMerchandiserIds([...selectedMerchandiserIds, u.id]);
                                        }
                                      }
                                    }}
                                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left border transition-all ${
                                      isSelected
                                        ? 'bg-indigo-100/90 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}} // handled by button click
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                                    />
                                    {u.avatar ? (
                                      <img
                                        src={u.avatar}
                                        alt={u.name}
                                        className="w-6 h-6 rounded-full object-cover border border-indigo-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                        {u.name.charAt(0)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold truncate">{u.name}</p>
                                      <p className="text-[10px] text-slate-500 truncate">
                                        {u.posteLabel || (u.role === 'resp_point_clients' ? 'Resp Point Clients' : u.role === 'merch' ? 'Commerciale / Merch' : 'Admin')}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                          </div>
                          <p className="text-[10px] text-indigo-700 italic">
                            Ces commerciales apparaîtront en bannière dédiée au-dessus du cadre photo dans le Kanban et sur la fiche identitaire.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          {initialMerchs.map((m, idx) => (
                            <div key={m.id || idx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                              {m.avatar ? (
                                <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                                  {m.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-xs font-bold text-slate-800">{m.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Frame Photo Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-indigo-600" />
                          Frame / Visuel Modèle
                        </label>
                        {card.frame && (
                          <button
                            type="button"
                            onClick={() => setViewingAttachment(card.frame)}
                            className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Agrandir
                          </button>
                        )}
                      </div>

                      {card.frame ? (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                          <img
                            src={card.frame.fileUrl}
                            alt="Frame Modèle"
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(card.frame!.id, 'frame', card.frame!.name)}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-700"
                              title="Supprimer la photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-700">Aucune photo de frame importée</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Format conseillé: JPG, PNG</p>
                          {canEdit && (
                            <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-indigo-700 transition-colors shadow-2xs">
                              <Upload className="w-3.5 h-3.5" /> Charger une photo
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'frame')}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dossier Technique Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-rose-600" />
                          Dossier Technique (PDF)
                        </label>
                        {card.dossierTechnique && (
                          <button
                            type="button"
                            onClick={() => setViewingAttachment(card.dossierTechnique)}
                            className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Visualiser PDF
                          </button>
                        )}
                      </div>

                      {card.dossierTechnique ? (
                        <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-8 h-8 text-rose-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {card.dossierTechnique.name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {card.dossierTechnique.size || 'PDF'} — Importé par {card.dossierTechnique.uploadedBy}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingAttachment(card.dossierTechnique)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-white transition-colors"
                              title="Ouvrir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveAttachment(
                                    card.dossierTechnique!.id,
                                    'dossier_technique',
                                    card.dossierTechnique!.name
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                          <p className="text-xs font-medium text-slate-600">Aucun Dossier Technique (.pdf)</p>
                          {canEdit && (
                            <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-slate-800 transition-colors">
                              <Upload className="w-3.5 h-3.5" /> Inserer un fichier .pdf
                              <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={(e) => handleFileUpload(e, 'dossier_technique')}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Editable Specifications */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-2 flex items-center justify-between">
                      <span>Détails & Spécifications</span>
                      <span className="text-[11px] text-slate-400 font-normal normal-case">
                        Renseignez les données du modèle
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Référence
                        </label>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Client
                        </label>
                        <input
                          type="text"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Nom du Modèle
                      </label>
                      <input
                        type="text"
                        value={modele}
                        onChange={(e) => setModele(e.target.value)}
                        disabled={!canEdit}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Matière(s) & Composition
                      </label>
                      <input
                        type="text"
                        value={matiere}
                        onChange={(e) => setMatiere(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Ex: Soie Mulberry 100%, Boutons Nacre"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          Prix Unitaire (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={prix}
                          onChange={(e) => setPrix(Number(e.target.value))}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 text-xs font-bold text-emerald-800 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          Quantités
                        </label>
                        <input
                          type="number"
                          value={quantites}
                          onChange={(e) => setQuantites(Number(e.target.value))}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 text-xs font-bold text-blue-800 bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Date de Création
                        </label>
                        <input
                          type="text"
                          disabled
                          value={new Date(card.dateCreation).toLocaleDateString('fr-FR')}
                          className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Date de Livraison Prévue
                        </label>
                        <input
                          type="date"
                          value={dateLivraison}
                          onChange={(e) => setDateLivraison(e.target.value)}
                          disabled={!canEdit}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Notes & Historique Descriptif
                      </label>
                      <RichTextEditor
                        value={historiqueNote}
                        onChange={setHistoriqueNote}
                        disabled={!canEdit}
                        placeholder="Précisions sur la fabrication, ajustements ou historique du modèle... (Mise en forme, liens, images, emojis)"
                        minRows={3}
                        isDark={false}
                        users={allUsers}
                      />
                    </div>

                    {canEdit && (
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center justify-center gap-2 transition-colors mt-2"
                      >
                        <Save className="w-4 h-4" /> Enregistrer les spécifications
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Interactive Comments Section */}
              <div className="mt-6">
                <InteractiveCommentsSection
                  comments={card.comments || []}
                  currentUser={currentUser}
                  allUsers={allUsers}
                  onCommentsChange={(updatedComments) => {
                    onUpdateCard({
                      ...card,
                      comments: updatedComments,
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: STEP CHECKLISTS */}
            {activeTab === 'checklists' && (
              <div className="space-y-5">
                {/* Step selector bar */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                    Sélectionner l'Étape:
                  </span>
                  {steps.map((step) => {
                    const isCurrent = step.id === card.currentStepId;
                    const isSelected = step.id === selectedStepIdForChecklists;
                    const items = card.stepChecklists[step.id] || step.defaultChecklists;
                    const doneCount = items.filter((i) => i.completed).length;

                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => setSelectedStepIdForChecklists(step.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{step.name}</span>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Étape actuelle" />
                        )}
                        <span className="text-[10px] opacity-75 bg-black/10 px-1 rounded">
                          {doneCount}/{items.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Step Banner */}
                {(() => {
                  const targetStep = steps.find((s) => s.id === selectedStepIdForChecklists) || steps[0];
                  const currentItems = card.stepChecklists[targetStep.id] || targetStep.defaultChecklists;

                  return (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-md text-xs font-bold border ${targetStep.color}`}>
                            Step {targetStep.order}: {targetStep.name}
                          </span>
                          {targetStep.id === card.currentStepId && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Étape active actuelle
                            </span>
                          )}
                        </div>

                        {canEdit && targetStep.id !== card.currentStepId && (
                          <button
                            type="button"
                            onClick={() => handleStepChange(targetStep.id)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg border border-indigo-200 transition-colors"
                          >
                            Mettre la carte à cette étape
                          </button>
                        )}
                      </div>

                      <StepChecklistTree
                        checklists={currentItems}
                        onChangeChecklists={(updated) => handleChecklistsChange(targetStep.id, updated)}
                        userRole={currentUser.role}
                        currentUserName={currentUser.name}
                        onLogAction={logAction}
                        isReadOnly={!canEdit}
                      />
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: ATTACHMENTS (FILES & MEDIA) */}
            {activeTab === 'attachments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Gestion des Pièces Jointes & Fichiers
                    </h3>
                    <p className="text-xs text-slate-500">
                      Insérez vos fichiers .pdf (dossier technique, patron), visuels de frame ou photos complémentaires.
                    </p>
                  </div>

                  {canEdit && (
                    <label className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-2 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> Inserer un fichier
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'attachement')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary PDF & Frame */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-600" /> Dossier Technique Principal
                    </h4>
                    {card.dossierTechnique ? (
                      <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">{card.dossierTechnique.name}</span>
                        <button
                          onClick={() => setViewingAttachment(card.dossierTechnique)}
                          className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                        >
                          Visualiser
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucun PDF attaché</p>
                    )}
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" /> Photo / Frame Principale
                    </h4>
                    {card.frame ? (
                      <div className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate">{card.frame.name}</span>
                        <button
                          onClick={() => setViewingAttachment(card.frame)}
                          className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700"
                        >
                          Visualiser
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucune photo attachée</p>
                    )}
                  </div>
                </div>

                {/* Additional Attachments List */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Autres pièces jointes ({card.attachments.length})
                    </h4>
                    {canEdit && (
                      <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
                        <Upload className="w-3.5 h-3.5" /> Ajouter un PDF / Fichier
                        <input
                          type="file"
                          accept=".pdf,application/pdf,image/*,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'attachement')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {card.attachments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">
                      Aucun attachement complémentaire pour cette carte.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {card.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {att.mimeType.startsWith('image/') ? (
                              <ImageIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                            ) : (
                              <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{att.name}</p>
                              <p className="text-[11px] text-slate-400">
                                Ajouté le {new Date(att.uploadedAt).toLocaleDateString('fr-FR')} par {att.uploadedBy} ({att.size})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewingAttachment(att)}
                              className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold hover:bg-indigo-100"
                            >
                              Aperçu
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleRemoveAttachment(att.id, 'attachement', att.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: MEMBERS & ACCESS */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* SECTION A: VISITEURS OBSERVATEURS INVITÉS (Par e-mail) */}
                <div className="bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 p-5 rounded-xl border border-amber-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-amber-600" />
                        Visiteurs Observateurs Invités par E-mail
                      </h3>
                      <p className="text-[11px] text-amber-800/80 mt-0.5">
                        Le visiteur invité ne peut observer que cette fiche identitaire en lecture seule (accès strictement restreint).
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isPointClients && (
                        <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-600 text-white rounded-full flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-3 h-3" />
                          Privilège Resp Point Clients
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-full">
                        {card.invitedVisitors?.length || 0} invité(s)
                      </span>
                    </div>
                  </div>

                  {/* Form to invite visitor (Restricted to Resp Point Clients and Admin) */}
                  {canInvite ? (
                    <form onSubmit={handleInviteVisitor} className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-indigo-600" />
                          Inviter un nouvel observateur par e-mail
                        </label>
                        <span className="text-[10px] text-slate-500 italic">
                          Invitation directe avec mot de passe auto-généré
                        </span>
                      </div>

                      {inviteErrorMsg && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{inviteErrorMsg}</span>
                        </div>
                      )}

                      {inviteSuccessMsg && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{inviteSuccessMsg}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <input
                            type="email"
                            required
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="visiteur@client.com *"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <input
                            type="text"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="Nom du visiteur (ex: Jean Dupont)"
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="sm:col-span-1 flex gap-2">
                          <input
                            type="text"
                            value={inviteNotes}
                            onChange={(e) => setInviteNotes(e.target.value)}
                            placeholder="Note / Rôle externe (facultatif)"
                            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="submit"
                            disabled={!inviteEmail}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Inviter
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Seul le <strong>Responsable Point Clients</strong> ou un Directeur peut inviter ou révoquer des visiteurs sur cette fiche.
                      </span>
                    </div>
                  )}

                  {/* List of invited visitors */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Observateurs enregistrés sur cette fiche ({card.invitedVisitors?.length || 0})
                    </h4>

                    {(!card.invitedVisitors || card.invitedVisitors.length === 0) ? (
                      <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-center">
                        <Eye className="w-5 h-5 text-amber-500 mx-auto mb-1 opacity-70" />
                        <p className="text-xs font-semibold text-amber-900">Aucun visiteur invité pour l'instant</p>
                        <p className="text-[11px] text-amber-700/80">
                          Utilisez le formulaire ci-dessus pour inviter un tiers en observation exclusive.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {card.invitedVisitors.map((vis) => (
                          <div
                            key={vis.id}
                            className="p-3.5 border border-amber-200/90 rounded-xl bg-white shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {vis.avatar ? (
                                <img
                                  src={vis.avatar}
                                  alt={vis.name}
                                  className="w-9 h-9 rounded-full object-cover border border-amber-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                                  {vis.name.charAt(0)}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-slate-900 truncate">{vis.name}</p>
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 uppercase">
                                    Observateur
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{vis.email}</p>
                                {vis.invitedBy && (
                                  <p className="text-[10px] text-amber-800/80 truncate">
                                    Invité par {vis.invitedBy}
                                  </p>
                                )}
                              </div>
                            </div>

                            {canRemove && (
                              <button
                                type="button"
                                onClick={() => handleRemoveVisitor(vis.email, vis.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 shrink-0"
                                title="Révoquer et retirer le visiteur"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION B: MEMBRES ÉQUIPE & CLIENTS */}
                <div className="space-y-4">
                  {/* Add member form */}
                  {canEdit && (
                    <form onSubmit={handleAddMember} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-indigo-600" />
                        Associer un Membre ou un Client de l'équipe
                      </h3>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Choisir un utilisateur --</option>
                          {allUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role.toUpperCase()}) - {u.email}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedMemberRole}
                          onChange={(e) => setSelectedMemberRole(e.target.value as UserRole)}
                          className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        >
                          <option value="merch">Accès MERCH (Modification complète)</option>
                          <option value="client">Accès CLIENT (Observation / Lecture seule)</option>
                        </select>

                        <button
                          type="submit"
                          disabled={!selectedUserId}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs disabled:opacity-50 transition-colors"
                        >
                          Ajouter
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of active members */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Membres autorisés sur cette carte ({card.members.length})
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {card.members.map((member) => (
                        <div
                          key={member.id}
                          className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                                {member.name.charAt(0)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{member.name}</p>
                              <p className="text-[11px] text-slate-500 truncate">{member.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {initialMerchs.some(
                              (m) => (m.id && m.id === member.id) || m.name.toLowerCase() === member.name.toLowerCase()
                            ) && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" /> Commerciale Responsable
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                member.role === 'merch'
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {member.role === 'merch' ? 'MERCH (Édition)' : 'CLIENT (Lecture)'}
                            </span>

                            {canEdit && card.members.length > 1 && (
                              <button
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Retirer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AUDIT LOG MODIFICATION HISTORY TABLE & COMMENTS */}
            {activeTab === 'history' && (
              <div className="space-y-5">
                <InteractiveCommentsSection
                  comments={card.comments || []}
                  currentUser={currentUser}
                  onCommentsChange={(updatedComments) => {
                    onUpdateCard({
                      ...card,
                      comments: updatedComments,
                    });
                  }}
                />

                <HistoryLogTable logs={card.historyLogs} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      <FileViewerModal attachment={viewingAttachment} onClose={() => setViewingAttachment(null)} />
    </>
  );
};
