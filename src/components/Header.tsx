import React from 'react';
import { UserProfile } from '../types';
import { canUserCreateOrEditCards } from '../utils/permissions';
import {
  Layers,
  LayoutGrid,
  List,
  Plus,
  Search,
  Shield,
  Eye,
  Settings,
  LogOut,
  User,
  LogIn,
} from 'lucide-react';

interface HeaderProps {
  viewMode: 'kanban' | 'list';
  onViewModeChange: (mode: 'kanban' | 'list') => void;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  onUserChange: (user: UserProfile) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenCreateCard: () => void;
  onOpenStepConfig: () => void;
  totalCards: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  currentUser,
  allUsers,
  onUserChange,
  onLogout,
  onOpenAuthModal,
  searchTerm,
  onSearchChange,
  onOpenCreateCard,
  onOpenStepConfig,
  totalCards,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Suivi de Flux & Fiches Cartes
              </h1>
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                {totalCards} carte{totalCards > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pipeline de fabrication • Checklists ajustables • Fiches identitaires
            </p>
          </div>
        </div>

        {/* Right side controls: Current User, Switcher, Logout & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 pl-2.5 rounded-xl border border-slate-700/80 shadow-xs">
              {/* User Identity Info */}
              <div className="flex items-center gap-2">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentUser.name.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-indigo-300 font-medium capitalize truncate">
                    {currentUser.posteLabel || currentUser.role}
                  </p>
                </div>
              </div>

              {/* Explicit Logout Button */}
              <button
                onClick={onLogout}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold rounded-lg border border-red-500/30 flex items-center gap-1 transition-colors ml-1"
                title="Se déconnecter de votre compte"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Se Connecter / S'inscrire</span>
            </button>
          )}

          {/* Action Buttons */}
          {canUserCreateOrEditCards(currentUser) && (
            <button
              onClick={onOpenStepConfig}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Ajuster la séquence des steps et checklists par défaut"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Ajuster</span> Steps
            </button>
          )}

          {canUserCreateOrEditCards(currentUser) && (
            <button
              onClick={onOpenCreateCard}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Carte</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Header: View switcher & Live Search */}
      <div className="bg-slate-950/60 border-t border-slate-800/80 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Vue Kanban
            </button>

            <button
              onClick={() => onViewModeChange('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Tableau Liste
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par référence, modèle, client..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-900 text-white border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

