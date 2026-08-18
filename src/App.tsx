import React, { useState, useEffect } from 'react';
import { Card, StepDefinition, UserProfile } from './types';
import { DEFAULT_STEPS, INITIAL_CARDS, DEFAULT_USERS } from './data/initialData';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { CardListView } from './components/CardListView';
import { ClientsView } from './components/ClientsView';
import { CardIdentityModal } from './components/CardIdentityModal';
import { StepConfigModal } from './components/StepConfigModal';
import { CreateCardModal } from './components/CreateCardModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { Layers } from 'lucide-react';

const STORAGE_CARDS_KEY = 'suivi_flux_cards_v2';
const STORAGE_STEPS_KEY = 'suivi_flux_steps_v2';
const STORAGE_USERS_KEY = 'suivi_flux_users_v2';
const STORAGE_CURRENT_USER_KEY = 'suivi_flux_current_user_v2';

export default function App() {
  const [cards, setCards] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CARDS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [steps, setSteps] = useState<StepDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STEPS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_STEPS;
    } catch {
      return DEFAULT_STEPS;
    }
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'clients'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isStepConfigOpen, setIsStepConfigOpen] = useState(false);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const activeUser = currentUser || DEFAULT_USERS[0];

  // User Profile Update handler
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id || (!currentUser && updatedUser.id === DEFAULT_USERS[0].id)) {
      setCurrentUser(updatedUser);
    }
  };

  // Sync cards with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CARDS_KEY, JSON.stringify(cards));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [cards]);

  // Sync steps with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STEPS_KEY, JSON.stringify(steps));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [steps]);

  // Sync allUsers with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(allUsers));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [allUsers]);

  // Sync currentUser with LocalStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleSignup = (newUser: UserProfile) => {
    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
  };

  // Handle Card Update
  const handleUpdateCard = (updatedCard: Card) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
  };

  // Handle Card Creation
  const handleCreateCard = (newCard: Card) => {
    setCards((prev) => [newCard, ...prev]);
  };

  // Move Card between steps quickly in Kanban
  const handleMoveCardStep = (cardId: string, targetStepId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const oldStep = steps.find((s) => s.id === card.currentStepId)?.name || card.currentStepId;
    const newStep = steps.find((s) => s.id === targetStepId)?.name || targetStepId;

    const newLog = {
      id: `hist-${Date.now()}`,
      cardId,
      authorName: activeUser.name,
      authorRole: activeUser.role,
      action: `Changement Step: ${oldStep} → ${newStep}`,
      details: `Carte déplacée via Kanban`,
      timestamp: new Date().toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    const updatedCard: Card = {
      ...card,
      currentStepId: targetStepId,
      historyLogs: [newLog, ...card.historyLogs],
    };

    handleUpdateCard(updatedCard);
  };

  // Helper to check if a card belongs to a client user
  const isCardForClient = (card: Card, user: UserProfile | null): boolean => {
    if (!user || user.role !== 'client') return true; // Non-clients can see all cards

    const userId = user.id.toLowerCase();
    const userEmail = (user.email || '').toLowerCase().trim();
    const userNameClean = user.name.toLowerCase().replace(/\(client\)/gi, '').trim();

    // 1. Member check
    const isMember = card.members?.some((m) => {
      if (m.id && m.id.toLowerCase() === userId) return true;
      if (m.email && userEmail && m.email.toLowerCase().trim() === userEmail) return true;
      if (m.name) {
        const mNameClean = m.name.toLowerCase().replace(/\(client\)/gi, '').trim();
        if (mNameClean === userNameClean || mNameClean.includes(userNameClean) || userNameClean.includes(mNameClean)) {
          return true;
        }
      }
      return false;
    });

    if (isMember) return true;

    // 2. Client Name check on card
    const cardClientClean = (card.clientName || '').toLowerCase().replace(/\(client\)/gi, '').trim();
    if (
      cardClientClean.length > 0 &&
      (cardClientClean === userNameClean ||
        cardClientClean.includes(userNameClean) ||
        userNameClean.includes(cardClientClean))
    ) {
      return true;
    }

    return false;
  };

  // Filter cards by client permissions & search term
  const filteredCards = cards.filter((card) => {
    // Client role restriction: only show cards linked to this client
    if (!isCardForClient(card, activeUser)) {
      return false;
    }

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      card.reference.toLowerCase().includes(q) ||
      card.modele.toLowerCase().includes(q) ||
      card.clientName.toLowerCase().includes(q) ||
      card.descriptionSpec.matiere.toLowerCase().includes(q)
    );
  });

  // Save updated steps and reassign orphan cards if a step was deleted
  const handleSaveSteps = (updatedSteps: StepDefinition[]) => {
    setSteps(updatedSteps);

    if (updatedSteps.length > 0) {
      const validStepIds = new Set(updatedSteps.map((s) => s.id));
      const fallbackStep = updatedSteps[0];

      setCards((prevCards) =>
        prevCards.map((card) => {
          if (!validStepIds.has(card.currentStepId)) {
            const reassignLog = {
              id: `hist-reassign-${Date.now()}-${Math.random()}`,
              cardId: card.id,
              authorName: currentUser?.name || 'Système',
              authorRole: currentUser?.role || 'system',
              action: `Réassignation automatique d'étape`,
              details: `L'étape associée a été supprimée du pipeline. Carte déplacée vers "${fallbackStep.name}"`,
              timestamp: new Date().toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            };

            return {
              ...card,
              currentStepId: fallbackStep.id,
              historyLogs: [reassignLog, ...card.historyLogs],
            };
          }
          return card;
        })
      );
    }
  };

  // If user is logged out, block access to the app completely
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
        {/* Decorative background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 max-w-md z-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-xl shadow-indigo-600/40 ring-1 ring-indigo-400/30">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1.5">
            Suivi de Flux & Fiches Cartes
          </h1>
          <p className="text-xs text-slate-400">
            Accès sécurisé. Veuillez vous connecter avec votre e-mail et mot de passe pour accéder au système.
          </p>
        </div>

        <AuthModal
          isOpen={true}
          isDismissable={false}
          allUsers={allUsers}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentUser={currentUser}
        allUsers={allUsers}
        onUserChange={setCurrentUser}
        onLogout={handleLogout}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenCreateCard={() => setIsCreateCardOpen(true)}
        onOpenStepConfig={() => setIsStepConfigOpen(true)}
        totalCards={filteredCards.length}
      />

      {/* Main Content View */}
      <main className="flex-1 py-4">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            cards={filteredCards}
            steps={steps}
            currentUser={activeUser}
            onCardClick={setSelectedCard}
            onMoveCardStep={handleMoveCardStep}
          />
        ) : viewMode === 'list' ? (
          <CardListView
            cards={filteredCards}
            steps={steps}
            allUsers={allUsers}
            onCardClick={setSelectedCard}
          />
        ) : (
          <ClientsView
            cards={filteredCards}
            steps={steps}
            allUsers={allUsers}
            currentUser={activeUser}
            onCardClick={setSelectedCard}
            onAddClientUser={(newClient) => setAllUsers((prev) => [...prev, newClient])}
            onUpdateClientUser={(updatedClient) =>
              setAllUsers((prev) => prev.map((u) => (u.id === updatedClient.id ? updatedClient : u)))
            }
            onRenameClientInCards={(oldName, newName) =>
              setCards((prev) =>
                prev.map((c) =>
                  c.clientName.toLowerCase().trim() === oldName.toLowerCase().trim()
                    ? { ...c, clientName: newName }
                    : c
                )
              )
            }
          />
        )}
      </main>

      {/* Card Identity Modal ("Fiche identitaire de la carte") */}
      {selectedCard && (
        <CardIdentityModal
          card={selectedCard}
          steps={steps}
          allUsers={allUsers}
          currentUser={activeUser}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCard}
        />
      )}

      {/* Pipeline Step Configuration Modal */}
      {isStepConfigOpen && (
        <StepConfigModal
          steps={steps}
          onClose={() => setIsStepConfigOpen(false)}
          onSaveSteps={handleSaveSteps}
        />
      )}

      {/* Create Card Modal */}
      {isCreateCardOpen && (
        <CreateCardModal
          steps={steps}
          allUsers={allUsers}
          currentUser={activeUser}
          onClose={() => setIsCreateCardOpen(false)}
          onCreateCard={handleCreateCard}
        />
      )}

      {/* Auth / Login / Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        allUsers={allUsers}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* User Profile & Avatar Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={activeUser}
          allUsers={allUsers}
          onUpdateUser={handleUpdateUser}
        />
      )}
    </div>
  );
}

