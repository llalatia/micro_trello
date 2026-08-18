import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AvatarPicker } from './AvatarPicker';
import {
  X,
  User,
  Mail,
  Briefcase,
  Lock,
  Save,
  Check,
  Camera,
  Users,
  Shield,
  Sparkles,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onSwitchUser?: (user: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onUpdateUser,
  onSwitchUser,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const targetUser = allUsers.find((u) => u.id === selectedUserId) || currentUser;

  const [name, setName] = useState(targetUser.name);
  const [email, setEmail] = useState(targetUser.email);
  const [posteLabel, setPosteLabel] = useState(targetUser.posteLabel || '');
  const [password, setPassword] = useState(targetUser.password || '123456');
  const [avatar, setAvatar] = useState(targetUser.avatar || '');
  const [isSaved, setIsSaved] = useState(false);

  // When switching selected target user in manager view
  const handleSelectUser = (u: UserProfile) => {
    setSelectedUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPosteLabel(u.posteLabel || '');
    setPassword(u.password || '123456');
    setAvatar(u.avatar || '');
    setIsSaved(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser: UserProfile = {
      ...targetUser,
      name: name.trim(),
      email: email.trim(),
      posteLabel: posteLabel.trim() || targetUser.posteLabel,
      password: password || '123456',
      avatar: avatar.trim() || undefined,
    };

    onUpdateUser(updatedUser);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Profil & Photo d'avatar
              </h3>
              <p className="text-xs text-slate-400">
                Personnalisez votre photo de profil, avatar et informations d'utilisateur
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick User Selector if multiple team members exist */}
        {allUsers.length > 1 && (
          <div className="bg-slate-950/40 border-b border-slate-100 px-5 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Utilisateur :
            </span>
            <div className="flex items-center gap-1.5">
              {allUsers.map((u) => {
                const isSelected = u.id === targetUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-4 h-4 rounded-full object-cover border border-white"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-indigo-500 text-white font-bold text-[8px] flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                    )}
                    <span>{u.name.split(' ')[0]}</span>
                    {u.id === currentUser.id && (
                      <span className="text-[9px] px-1 bg-white/20 rounded font-normal">Moi</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Avatar Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Photo de Profil / Avatar
            </label>

            <AvatarPicker
              currentAvatar={avatar}
              userName={name}
              onSelectAvatar={(newAvatarUrl) => setAvatar(newAvatarUrl)}
              onClearAvatar={() => setAvatar('')}
            />
          </div>

          {/* User Information Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom complet *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Sophie Bertrand"
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Intitulé de poste / Rôle
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={posteLabel}
                  onChange={(e) => setPosteLabel(e.target.value)}
                  placeholder="ex: Commerciale / Merchandiser"
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mot de passe de session
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" /> Profil et avatar mis à jour !
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fermer
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Modifications</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
