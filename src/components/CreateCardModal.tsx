import React, { useState } from 'react';
import { Card, StepDefinition, UserProfile, CardAttachment } from '../types';
import { canUserCreateOrEditCards } from '../utils/permissions';
import { X, Plus, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

interface CreateCardModalProps {
  steps: StepDefinition[];
  allUsers: UserProfile[];
  currentUser: UserProfile;
  onClose: () => void;
  onCreateCard: (newCard: Card) => void;
}

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
  steps,
  allUsers,
  currentUser,
  onClose,
  onCreateCard,
}) => {
  const clientUsers = allUsers.filter((u) => u.role === 'client');

  if (!canUserCreateOrEditCards(currentUser)) {
    return null;
  }

  const [reference, setReference] = useState(`REF-2026-00${Math.floor(Math.random() * 900 + 100)}`);
  const [modele, setModele] = useState('');
  const [clientName, setClientName] = useState(() => {
    if (currentUser.role === 'client') return currentUser.name;
    return clientUsers.length > 0 ? clientUsers[0].name : 'Maison Haute Couture';
  });
  const [matiere, setMatiere] = useState('');
  const [prix, setPrix] = useState(250);
  const [quantites, setQuantites] = useState(100);
  const [dateLivraison, setDateLivraison] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const [dossierPdf, setDossierPdf] = useState<CardAttachment | null>(null);
  const [framePhoto, setFramePhoto] = useState<CardAttachment | null>(null);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("Ce fichier PDF dépasse la taille maximale (15 Mo). Veuillez choisir un document plus léger.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setDossierPdf({
        id: `att-dt-${Date.now()}`,
        name: file.name,
        fileUrl: event.target?.result as string,
        mimeType: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        category: 'dossier_technique',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFramePhoto({
        id: `att-frame-${Date.now()}`,
        name: file.name,
        fileUrl: event.target?.result as string,
        mimeType: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        category: 'frame',
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modele.trim() || !reference.trim()) return;

    const firstStep = steps[0];

    const initialMembers = [
      {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        avatar: currentUser.avatar,
        addedAt: new Date().toISOString(),
      },
    ];

    // If client user found in allUsers, add them as member if not present
    const matchedClient = allUsers.find(
      (u) =>
        u.role === 'client' &&
        (u.name.toLowerCase().trim() === clientName.toLowerCase().trim() ||
          u.email.toLowerCase().trim() === clientName.toLowerCase().trim())
    );

    if (matchedClient && matchedClient.id !== currentUser.id) {
      initialMembers.push({
        id: matchedClient.id,
        name: matchedClient.name,
        email: matchedClient.email,
        role: matchedClient.role,
        avatar: matchedClient.avatar,
        addedAt: new Date().toISOString(),
      });
    }

    const newCard: Card = {
      id: `card-${Date.now()}`,
      reference: reference.trim(),
      modele: modele.trim(),
      clientName: clientName.trim(),
      currentStepId: firstStep.id,
      status: 'en_cours',
      dateCreation: new Date().toISOString(),
      dateLivraison: new Date(dateLivraison).toISOString(),
      dossierTechnique: dossierPdf,
      frame: framePhoto,
      attachments: [],
      descriptionSpec: {
        modele: modele.trim(),
        matiere: matiere.trim() || 'Textile standard',
        prix: Number(prix),
        quantites: Number(quantites),
        historiqueNote: 'Carte créée via l\'interface.',
      },
      members: initialMembers,
      stepChecklists: {},
      historyLogs: [
        {
          id: `hist-${Date.now()}`,
          cardId: `card-${Date.now()}`,
          authorName: currentUser.name,
          authorRole: currentUser.role,
          action: 'Création de la carte',
          details: `Modèle: ${modele.trim()} (${reference.trim()})`,
          timestamp: new Date().toLocaleString('fr-FR'),
        },
      ],
    };

    onCreateCard(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Créer une nouvelle Carte de Suivi</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Référence <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Client / Marque <span className="text-rose-500">*</span>
              </label>
              {currentUser.role === 'client' ? (
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full px-3 py-1.5 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold cursor-not-allowed"
                />
              ) : (
                <input
                  type="text"
                  required
                  placeholder="ex: Maison Haute Couture"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  list="clients-list"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              )}
              {currentUser.role !== 'client' && (
                <datalist id="clients-list">
                  {clientUsers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nom du Modèle <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="ex: Chemise Soie Oversize Signature"
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Matière / Tissu Principal
            </label>
            <input
              type="text"
              placeholder="ex: 100% Soie Mulberry Crêpe de Chine"
              value={matiere}
              onChange={(e) => setMatiere(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Prix Unitaire (€)
              </label>
              <input
                type="number"
                value={prix}
                onChange={(e) => setPrix(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quantité (pcs)
              </label>
              <input
                type="number"
                value={quantites}
                onChange={(e) => setQuantites(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Livraison Prévue
              </label>
              <input
                type="date"
                value={dateLivraison}
                onChange={(e) => setDateLivraison(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Files Upload Boxes */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-rose-600" /> Dossier Tech (.pdf)
              </label>
              {dossierPdf ? (
                <p className="text-xs text-emerald-700 font-medium truncate">{dossierPdf.name}</p>
              ) : (
                <label className="block text-center py-2 px-3 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                  + PDF Dossier Technique
                  <input type="file" accept=".pdf,application/pdf" onChange={handlePdfUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Visuel Frame (Photo)
              </label>
              {framePhoto ? (
                <p className="text-xs text-emerald-700 font-medium truncate">{framePhoto.name}</p>
              ) : (
                <label className="block text-center py-2 px-3 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                  + Photo Frame
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Créer la Carte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
