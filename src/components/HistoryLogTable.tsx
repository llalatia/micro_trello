import React from 'react';
import { HistoryLog } from '../types';
import { Clock, User, FileText, ArrowRight } from 'lucide-react';

interface HistoryLogTableProps {
  logs: HistoryLog[];
}

export const HistoryLogTable: React.FC<HistoryLogTableProps> = ({ logs }) => {
  // Sort logs from newest to oldest
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (sortedLogs.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg">
        <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">Aucun historique de modification</p>
        <p className="text-xs text-slate-400 mt-1">
          Les actions effectuées sur cette carte (changement d'étape, cocher une checklist, ajout de fichier) apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          Historique des modifications ({sortedLogs.length})
        </h4>
        <span className="text-[11px] text-slate-500">Horodatage précis avec auteur</span>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Date & Heure exacte</th>
              <th className="py-2.5 px-3">Auteur</th>
              <th className="py-2.5 px-3">Action / Modification</th>
              <th className="py-2.5 px-3">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {sortedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                  {log.timestamp}
                </td>

                <td className="py-2.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                      {log.authorName.charAt(0)}
                    </span>
                    <span className="font-medium text-slate-800">{log.authorName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        log.authorRole === 'merch'
                          ? 'bg-indigo-100 text-indigo-800'
                          : log.authorRole === 'client'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {log.authorRole}
                    </span>
                  </div>
                </td>

                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  <span className="inline-flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                    {log.action}
                  </span>
                </td>

                <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                  {log.details || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
