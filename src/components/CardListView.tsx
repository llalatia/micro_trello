import React from 'react';
import { Card, StepDefinition } from '../types';
import { FileText, Image as ImageIcon, Eye, CheckSquare, Calendar, ChevronRight, MessageSquare } from 'lucide-react';

interface CardListViewProps {
  cards: Card[];
  steps: StepDefinition[];
  onCardClick: (card: Card) => void;
}

export const CardListView: React.FC<CardListViewProps> = ({ cards, steps, onCardClick }) => {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4">Modèle</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Étape Actuelle</th>
                <th className="py-3.5 px-4">Dossier Tech (PDF)</th>
                <th className="py-3.5 px-4">Frame</th>
                <th className="py-3.5 px-4">Livraison</th>
                <th className="py-3.5 px-4">Checklists</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 italic">
                    Aucune carte ne correspond à la recherche.
                  </td>
                </tr>
              ) : (
                cards.map((card) => {
                  const currentStep = steps.find((s) => s.id === card.currentStepId) || steps[0];
                  const items = card.stepChecklists[currentStep.id] || currentStep.defaultChecklists;
                  const done = items.filter((i) => i.completed).length;

                  return (
                    <tr
                      key={card.id}
                      onClick={() => onCardClick(card)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{card.reference}</span>
                          {card.comments && card.comments.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200" title={`${card.comments.length} message(s)`}>
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              {card.comments.length}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-indigo-600">
                        {card.modele}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {card.clientName}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${currentStep.color}`}>
                          Step {currentStep.order}: {currentStep.name}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {card.dossierTechnique ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <FileText className="w-3.5 h-3.5" /> {card.dossierTechnique.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {card.frame ? (
                          <div className="w-10 h-7 rounded overflow-hidden border border-slate-300 bg-slate-900">
                            <img src={card.frame.fileUrl} alt="frame" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(card.dateLivraison).toLocaleDateString('fr-FR')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          {done} / {items.length}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCardClick(card);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Fiche Identitaire
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
