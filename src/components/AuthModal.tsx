import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AvatarPicker } from './AvatarPicker';
import { AVATAR_PRESETS } from '../data/avatarPresets';
import { LogIn, UserPlus, X, Lock, Mail, User, Briefcase, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  allUsers: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onSignup: (newUser: UserProfile) => void;
  initialMode?: 'login' | 'signup';
  isDismissable?: boolean;
}

export const ROLES_LIST = [
  { value: 'merch', label: 'Merchandiser / Éditeur' },
  { value: 'client', label: 'Client / Marque' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'directeur', label: 'Directeur / Direction' },
  { value: 'fournisseur', label: 'Fournisseur / Sous-traitant' },
  { value: 'magasinier', label: 'Magasinier / Stock' },
  { value: 'resp_planning', label: 'Responsable Planning' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  onLogin,
  onSignup,
  initialMode = 'login',
  isDismissable = true,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('merch');
  const [signupAvatar, setSignupAvatar] = useState(AVATAR_PRESETS[0].url);
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = allUsers.find(
      (u) => u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim()
    );

    if (!user) {
      setError("Aucun compte trouvé avec cet e-mail. Veuillez vérifier ou vous inscrire.");
      return;
    }

    const expectedPassword = user.password || '123456';
    if (loginPassword !== expectedPassword) {
      setError("Mot de passe incorrect. (Mot de passe par défaut pour comptes démo : 123456)");
      return;
    }

    onLogin(user);
    setSuccess(`Ravi de vous revoir, ${user.name} !`);
    setTimeout(() => {
      onClose?.();
    }, 400);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const existing = allUsers.find(
      (u) => u.email.toLowerCase().trim() === signupEmail.toLowerCase().trim()
    );
    if (existing) {
      setError("Un compte existe déjà avec cette adresse email.");
      return;
    }

    const roleObj = ROLES_LIST.find((r) => r.value === signupRole);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      role: signupRole as any,
      posteLabel: roleObj ? roleObj.label : signupRole,
      password: signupPassword,
      avatar: signupAvatar || undefined,
    };

    onSignup(newUser);
    setSuccess(`Compte créé avec succès ! Bienvenue, ${newUser.name}.`);
    setTimeout(() => {
      onClose?.();
    }, 500);
  };

  const handlePrefillAccount = (user: UserProfile) => {
    setLoginEmail(user.email);
    setLoginPassword(user.password || '123456');
    setError(null);
    setSuccess(`Identifiants renseignés pour ${user.name}. Cliquez sur "Connexion" pour valider.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'login' ? 'Connexion Sécurisée' : 'Créer un nouveau compte'}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login'
                  ? 'Entrez vos identifiants pour accéder à l\'outil'
                  : 'Remplissez le formulaire d\'inscription'}
              </p>
            </div>
          </div>
          {isDismissable && onClose && (
            <button
              onClick={() => onClose?.()}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 gap-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            S'inscrire (Sign Up)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ex: sophie.bertrand@fashionbrand.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </button>

              {/* Quick test accounts helper */}
              <div className="pt-3 border-t border-slate-800/80">
                <p className="text-[11px] font-medium text-slate-400 mb-2">
                  Pré-remplir la démo (cliquer pour pré-remplir e-mail & mot de passe, puis valider par "Connexion") :
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handlePrefillAccount(u)}
                      className="w-full p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-lg text-left flex items-center justify-between text-xs text-slate-300 transition-colors"
                      title="Saisir automatiquement les identifiants de ce compte"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0 uppercase tracking-wider">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="ex: Jean Dupont"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="ex: jean.dupont@entreprise.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Poste / Fonction dans l'entreprise
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Selector in Signup */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Avatar Dessin Animé & Cool
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPresets = AVATAR_PRESETS;
                      const pick = randomPresets[Math.floor(Math.random() * randomPresets.length)];
                      setSignupAvatar(pick.url);
                    }}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    🎲 Aléatoire
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500 bg-slate-900 shrink-0 p-0.5">
                    <img
                      src={signupAvatar}
                      alt="Aperçu"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    Choisissez votre look D.A / Cartoon parmi la sélection :
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSignupAvatar(p.url)}
                      className={`relative rounded-full aspect-square p-0.5 overflow-hidden transition-all ${
                        signupAvatar === p.url
                          ? 'ring-2 ring-indigo-500 scale-105 bg-indigo-950'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      title={p.name}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Reconfirmation du mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-3"
              >
                <UserPlus className="w-4 h-4" />
                Valider mon Inscription
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
