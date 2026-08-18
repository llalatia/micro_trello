import { CardLabel } from '../types';

export const LABEL_COLOR_PRESETS = [
  {
    color: 'red',
    name: 'Rouge',
    bgClass: 'bg-rose-500 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    color: 'orange',
    name: 'Orange',
    bgClass: 'bg-amber-500 text-white',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    color: 'yellow',
    name: 'Jaune',
    bgClass: 'bg-yellow-400 text-slate-900',
    badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
  {
    color: 'green',
    name: 'Vert',
    bgClass: 'bg-emerald-500 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    color: 'blue',
    name: 'Bleu',
    bgClass: 'bg-blue-500 text-white',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    color: 'purple',
    name: 'Violet',
    bgClass: 'bg-purple-500 text-white',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    color: 'pink',
    name: 'Rose',
    bgClass: 'bg-pink-500 text-white',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  {
    color: 'sky',
    name: 'Ciel',
    bgClass: 'bg-sky-500 text-white',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    color: 'indigo',
    name: 'Indigo',
    bgClass: 'bg-indigo-600 text-white',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    color: 'slate',
    name: 'Gris',
    bgClass: 'bg-slate-600 text-white',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
  },
];

export const DEFAULT_LABELS: CardLabel[] = [
  {
    id: 'lbl-urgent',
    name: 'Urgent',
    color: 'red',
    bgClass: 'bg-rose-500 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: 'lbl-priorite',
    name: 'Priorité Haute',
    color: 'orange',
    bgClass: 'bg-amber-500 text-white',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'lbl-validation',
    name: 'Validation Client',
    color: 'green',
    bgClass: 'bg-emerald-500 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'lbl-prototype',
    name: 'Prototypage',
    color: 'blue',
    bgClass: 'bg-blue-500 text-white',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'lbl-echantillon',
    name: 'Échantillon Validé',
    color: 'sky',
    bgClass: 'bg-sky-500 text-white',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    id: 'lbl-broderie',
    name: 'Broderie & Dentelle',
    color: 'purple',
    bgClass: 'bg-purple-500 text-white',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 'lbl-vip',
    name: 'Modèle VIP',
    color: 'pink',
    bgClass: 'bg-pink-500 text-white',
    badgeClass: 'bg-pink-100 text-pink-800 border-pink-300',
  },
];
