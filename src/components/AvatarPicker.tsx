import React, { useState, useRef } from 'react';
import { AVATAR_PRESETS, AvatarPreset } from '../data/avatarPresets';
import {
  Upload,
  Link2,
  Sparkles,
  Check,
  Trash2,
  Camera,
  Wand2,
  Dices,
  Palette,
  Smile,
  Zap,
  Bot,
} from 'lucide-react';

interface AvatarPickerProps {
  currentAvatar?: string;
  userName?: string;
  onSelectAvatar: (avatarUrl: string) => void;
  onClearAvatar?: () => void;
}

type CategoryType = 'all' | 'da_cartoon' | 'manga_anime' | 'fun_3d' | 'notion_art' | 'photo';

const DA_STYLES = [
  { id: 'avataaars', label: 'Cartoon D.A', icon: Smile, prefix: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' },
  { id: 'lorelei', label: 'Manga / Anime', icon: Zap, prefix: 'https://api.dicebear.com/9.x/lorelei/svg?seed=' },
  { id: 'adventurer', label: 'Aventure Hero', icon: Sparkles, prefix: 'https://api.dicebear.com/9.x/adventurer/svg?seed=' },
  { id: 'bottts', label: 'Robot 3D', icon: Bot, prefix: 'https://api.dicebear.com/9.x/bottts/svg?seed=' },
  { id: 'fun-emoji', label: 'Emoji Fun', icon: Smile, prefix: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=' },
  { id: 'notionists', label: 'Art Notion', icon: Palette, prefix: 'https://api.dicebear.com/9.x/notionists/svg?seed=' },
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  userName = 'Utilisateur',
  onSelectAvatar,
  onClearAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'generator' | 'upload' | 'url'>('presets');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [customUrl, setCustomUrl] = useState('');
  const [urlError, setUrlError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // D.A Generator State
  const [genSeed, setGenSeed] = useState(userName.split(' ')[0] || 'Hero');
  const [selectedDaStyle, setSelectedDaStyle] = useState(DA_STYLES[0]);
  const [diceCount, setDiceCount] = useState(1);

  const generatedDaUrl = `${selectedDaStyle.prefix}${encodeURIComponent(genSeed || 'Star')}_${diceCount}`;

  const filteredPresets =
    categoryFilter === 'all'
      ? AVATAR_PRESETS
      : AVATAR_PRESETS.filter((p) => p.category === categoryFilter);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSelectAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectAvatar(customUrl.trim());
    setUrlError(false);
  };

  const handleRandomizeGen = () => {
    const randomSeeds = ['Aria', 'Kira', 'Max', 'Luna', 'Neo', 'Nova', 'Rex', 'Yuki', 'Sora', 'Milo', 'Fox', 'Pixel', 'Rocket', 'Shadow', 'Blaze', 'Cosmo'];
    const pick = randomSeeds[Math.floor(Math.random() * randomSeeds.length)];
    setGenSeed(pick);
    setDiceCount((prev) => prev + 1);
  };

  const initials =
    userName
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

  return (
    <div className="space-y-4">
      {/* Current Preview & Quick Controls */}
      <div className="flex items-center gap-4 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative group shrink-0">
          {currentAvatar ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-400 shadow-lg ring-4 ring-indigo-500/20 bg-slate-800 flex items-center justify-center">
              <img
                src={currentAvatar}
                alt={userName}
                className="w-full h-full object-cover"
                onError={() => setUrlError(true)}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xl flex items-center justify-center border-2 border-white/40 shadow-lg">
              {initials}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
            title="Changer la photo"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white truncate">{userName}</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
              Avatar Actif
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {currentAvatar ? 'Avatar personnalisé appliqué' : 'Initiales stylisées par défaut'}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Créer mon D.A</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>Fichier</span>
            </button>

            {currentAvatar && onClearAvatar && (
              <button
                type="button"
                onClick={onClearAvatar}
                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold rounded-lg border border-red-500/30 transition-colors flex items-center gap-1"
                title="Supprimer la photo et revenir aux initiales"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'presets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Galerie D.A & Cool</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('generator')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'generator'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Générateur D.A</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Importer une image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'url'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Lien Web</span>
        </button>
      </div>

      {/* Tab 1: Presets Gallery */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          {/* Style Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🌟 Tous les styles
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('da_cartoon')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'da_cartoon'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              🎨 D.A & Cartoon
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('manga_anime')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'manga_anime'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
              }`}
            >
              ⚡ Manga & Anime
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('fun_3d')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'fun_3d'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              🤖 Robots & Emojis
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('notion_art')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'notion_art'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              🎭 Croquis & Notion
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('photo')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                categoryFilter === 'photo'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📸 Photos
            </button>
          </div>

          {/* Grid of Avatars */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1.5 scrollbar-thin bg-slate-50 rounded-xl border border-slate-200">
            {filteredPresets.map((preset) => {
              const isSelected = currentAvatar === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectAvatar(preset.url)}
                  className={`relative flex flex-col items-center p-1.5 rounded-xl transition-all group ${
                    isSelected
                      ? 'bg-indigo-100/80 ring-2 ring-indigo-600 shadow-md scale-105'
                      : 'hover:bg-white hover:shadow-xs hover:scale-105'
                  }`}
                  title={preset.name}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shadow-2xs relative">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/40 rounded-full flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-800 truncate max-w-full mt-1">
                    {preset.name.split(' ')[0]}
                  </span>
                  {preset.badge && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase">
                      {preset.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom D.A Generator */}
      {activeTab === 'generator' && (
        <div className="bg-gradient-to-br from-purple-900/10 via-indigo-900/5 to-slate-50 p-4 rounded-2xl border border-purple-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-purple-600" />
                Générateur D.A Intelligent
              </h5>
              <p className="text-[11px] text-slate-600">
                Créez un avatar cartoon unique en combinant un style et un nom/graine.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRandomizeGen}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>🎲 Tirage Aléatoire</span>
            </button>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              1. Choisissez le style de Dessin Animé :
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DA_STYLES.map((st) => {
                const isPicked = selectedDaStyle.id === st.id;
                const IconComponent = st.icon;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedDaStyle(st)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isPicked
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[10.5px] font-bold truncate max-w-full">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seed Input & Big Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-purple-100 shadow-2xs">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-purple-50 p-1 border-2 border-purple-500 shadow-md ring-4 ring-purple-100 overflow-hidden">
                <img
                  src={generatedDaUrl}
                  alt="Aperçu D.A"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  2. Pseudo / Graine du personnage :
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genSeed}
                    onChange={(e) => setGenSeed(e.target.value)}
                    placeholder="Tapez un prénom ou mot clé..."
                    className="flex-1 px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDiceCount((prev) => prev + 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1"
                    title="Changer les variations d'expression"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Varier</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectAvatar(generatedDaUrl)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Adopter ce Dessin Animé comme Avatar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Local Upload */}
      {activeTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-300 hover:border-indigo-600 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Cliquez pour importer votre photo ou dessin
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Accepte JPG, PNG, GIF, WebP ou illustrations personnalisées
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Web URL */}
      {activeTab === 'url' && (
        <form onSubmit={handleApplyUrl} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL de l'image (HTTPS)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... ou https://..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="submit"
                disabled={!customUrl.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Appliquer
              </button>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1">
              Collez n'importe quel lien direct vers un avatar ou dessin animé hébergé sur le web.
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
