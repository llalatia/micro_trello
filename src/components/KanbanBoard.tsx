import React from 'react';
import { Card, StepDefinition, UserProfile } from '../types';
import { canUserCreateOrEditCards } from '../utils/permissions';
import {
  FileText,
  Image as ImageIcon,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Clock,
  User,
  Paperclip,
  MessageSquare,
} from 'lucide-react';

interface KanbanBoardProps {
  cards: Card[];
  steps: StepDefinition[];
  currentUser: UserProfile;
  onCardClick: (card: Card) => void;
  onMoveCardStep: (cardId: string, targetStepId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  cards,
  steps,
  currentUser,
  onCardClick,
  onMoveCardStep,
}) => {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  const canEdit = canUserCreateOrEditCards(currentUser);

  return (
    <div className="flex gap-3.5 overflow-x-auto pb-6 pt-2 px-4 sm:px-6 min-h-[calc(100vh-140px)] scrollbar-thin">
      {sortedSteps.map((step, index) => {
        const stepCards = cards.filter((c) => c.currentStepId === step.id);
        const cardCount = stepCards.length;
        const isCompact5Plus = cardCount >= 5;
        const isMedium3To4 = cardCount === 3 || cardCount === 4;

        const prevStep = index > 0 ? sortedSteps[index - 1] : null;
        const nextStep = index < sortedSteps.length - 1 ? sortedSteps[index + 1] : null;

        return (
          <div
            key={step.id}
            className="w-72 sm:w-80 shrink-0 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-col max-h-[82vh] shadow-2xs"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-slate-200 bg-white rounded-t-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {step.order}
                </span>
                <h3 className="text-xs font-bold text-slate-800 truncate" title={step.name}>
                  {step.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isCompact5Plus && (
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded" title="Affichage ultra-compact activé (5+ modèles)">
                    5+ Modèles
                  </span>
                )}
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {cardCount}
                </span>
              </div>
            </div>

            {/* Column Cards Container */}
            <div className="p-2 overflow-y-auto flex-1 space-y-2 scrollbar-thin">
              {cardCount === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs text-slate-400 font-medium">Aucune carte</p>
                </div>
              ) : (
                stepCards.map((card) => {
                  // Calculate checklist stats
                  const items = card.stepChecklists[step.id] || step.defaultChecklists;
                  const total = items.length;
                  const done = items.filter((i) => i.completed).length;
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                  // Determine card photo source
                  const photoUrl =
                    card.frame?.fileUrl ||
                    card.attachments.find((att) => att.mimeType.startsWith('image/'))?.fileUrl;

                  // -------------------------------------------------------------
                  // MODE 1: ULTRA-COMPACT VIEW (>= 5 CARDS)
                  // Displays only photo and reference number + short model name
                  // -------------------------------------------------------------
                  if (isCompact5Plus) {
                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-lg border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow transition-all p-1.5 space-y-1 group cursor-pointer"
                        onClick={() => onCardClick(card)}
                      >
                        {/* Reference Badge & Model Title */}
                        <div className="flex items-center justify-between gap-1.5 text-[10px]">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                              {card.reference}
                            </span>
                            {currentUser.role !== 'client' && card.comments && card.comments.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200" title={`${card.comments.length} message(s)`}>
                                <MessageSquare className="w-2.5 h-2.5" />
                                {card.comments.length}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-slate-700 truncate max-w-[110px]" title={card.modele}>
                            {card.modele}
                          </span>
                        </div>

                        {/* Compact Photo */}
                        <div className="relative rounded-md overflow-hidden bg-slate-950 border border-slate-200 h-16 w-full p-1 flex items-center justify-center">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={card.modele}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-[10px] gap-1">
                              <ImageIcon className="w-3.5 h-3.5" /> Pas de photo
                            </div>
                          )}
                        </div>

                        {/* Ultra-compact move controls on hover/always */}
                        {canEdit && (
                          <div
                            className="flex items-center justify-between pt-0.5 opacity-80 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {prevStep ? (
                              <button
                                type="button"
                                onClick={() => onMoveCardStep(card.id, prevStep.id)}
                                className="p-0.5 text-[10px] text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded flex items-center"
                                title={`Reculer vers ${prevStep.name}`}
                              >
                                <ChevronLeft className="w-3 h-3" />
                              </button>
                            ) : <div />}

                            {nextStep && (
                              <button
                                type="button"
                                onClick={() => onMoveCardStep(card.id, nextStep.id)}
                                className="p-0.5 text-[10px] text-indigo-600 hover:bg-indigo-50 rounded flex items-center ml-auto"
                                title={`Avancer vers ${nextStep.name}`}
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // -------------------------------------------------------------
                  // MODE 2: MEDIUM COMPACT VIEW (3 OR 4 CARDS)
                  // Displays photo, reference, model, client name & mini checklist
                  // -------------------------------------------------------------
                  if (isMedium3To4) {
                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow transition-all p-2 space-y-1.5 group cursor-pointer"
                        onClick={() => onCardClick(card)}
                      >
                        {/* Ref & Client */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {card.reference}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                            {card.clientName}
                          </span>
                        </div>

                        {/* Model Name */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {card.modele}
                        </h4>

                        {/* Photo */}
                        {photoUrl && (
                          <div className="rounded-lg overflow-hidden border border-slate-200 h-24 w-full bg-slate-950 p-1 flex items-center justify-center">
                            <img
                              src={photoUrl}
                              alt={card.modele}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Checklist progress mini */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <CheckSquare className="w-3 h-3 text-emerald-600" /> {done}/{total}
                          </span>
                          {currentUser.role !== 'client' && card.comments && card.comments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200" title={`${card.comments.length} message(s)`}>
                              <MessageSquare className="w-3 h-3 text-indigo-600" />
                              {card.comments.length}
                            </span>
                          )}
                          <span className="font-bold text-slate-600">{percent}%</span>
                        </div>

                        {/* Move controls */}
                        {canEdit && (
                          <div
                            className="flex items-center justify-between pt-1 border-t border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {prevStep ? (
                              <button
                                type="button"
                                onClick={() => onMoveCardStep(card.id, prevStep.id)}
                                className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded flex items-center gap-0.5"
                              >
                                <ChevronLeft className="w-3 h-3" /> {prevStep.name}
                              </button>
                            ) : <div />}

                            {nextStep && (
                              <button
                                type="button"
                                onClick={() => onMoveCardStep(card.id, nextStep.id)}
                                className="px-1.5 py-0.5 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded flex items-center gap-0.5 ml-auto"
                              >
                                {nextStep.name} <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // -------------------------------------------------------------
                  // MODE 3: FULL DETAILED VIEW (1 OR 2 CARDS)
                  // Displays complete details, full photo, badges & progress bar
                  // -------------------------------------------------------------
                  return (
                    <div
                      key={card.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all p-2.5 space-y-2 group cursor-pointer"
                      onClick={() => onCardClick(card)}
                    >
                      {/* Top Ref & Client */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {card.reference}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-32">
                          {card.clientName}
                        </span>
                      </div>

                      {/* Model Name */}
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {card.modele}
                      </h4>

                      {/* Frame / Photo Thumbnail */}
                      {photoUrl && (
                        <div className="rounded-lg overflow-hidden border border-slate-200 h-36 w-full bg-slate-950 p-1 flex items-center justify-center">
                          <img
                            src={photoUrl}
                            alt={card.modele}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Attachments & Files badging */}
                      <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        {card.dossierTechnique && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            <FileText className="w-3 h-3" /> PDF Tech
                          </span>
                        )}

                        {card.attachments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Paperclip className="w-3 h-3" /> +{card.attachments.length}
                          </span>
                        )}

                        {currentUser.role !== 'client' && card.comments && card.comments.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200" title={`${card.comments.length} message(s)`}>
                            <MessageSquare className="w-3 h-3 text-indigo-600" /> {card.comments.length} msg
                          </span>
                        )}

                        <span className="ml-auto text-[10px] text-slate-400">
                          Liv. {new Date(card.dateLivraison).toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' })}
                        </span>
                      </div>

                      {/* Step Checklist Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-emerald-600" />
                            Checklists: {done}/{total}
                          </span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              percent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Move buttons footer */}
                      {canEdit && (
                        <div
                          className="flex items-center justify-between pt-1 border-t border-slate-100 opacity-90 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStep ? (
                            <button
                              type="button"
                              onClick={() => onMoveCardStep(card.id, prevStep.id)}
                              className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded flex items-center gap-0.5"
                              title={`Reculer vers ${prevStep.name}`}
                            >
                              <ChevronLeft className="w-3 h-3" /> {prevStep.name}
                            </button>
                          ) : <div />}

                          {nextStep && (
                            <button
                              type="button"
                              onClick={() => onMoveCardStep(card.id, nextStep.id)}
                              className="px-2 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-2xs flex items-center gap-0.5 ml-auto"
                              title={`Avancer vers ${nextStep.name}`}
                            >
                              {nextStep.name} <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
