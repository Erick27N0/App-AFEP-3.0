import React, { useState } from "react";
import { 
  ArrowLeft, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Bell, 
  BookOpen, 
  FileText, 
  Compass, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { LocalReminder } from "../types";

interface RemindersProps {
  reminders: LocalReminder[];
  onBack: () => void;
  onAddReminder: (kind: "training" | "funding" | "opportunities", title: string, message: string, delayHours: number) => void;
  onMarkDone: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

const PRESETS = [
  {
    kind: "training" as const,
    title: "Continuer une formation",
    message: "Reprenez un module et avancez dans votre parcours d'onboarding Éclosion.",
    delayHours: 24,
    icon: <BookOpen size={16} />
  },
  {
    kind: "funding" as const,
    title: "Finaliser un pitch",
    message: "Complétez votre demande de financement pendant que vos idées de coopérative sont fraîches.",
    delayHours: 48,
    icon: <FileText size={16} />
  },
  {
    kind: "opportunities" as const,
    title: "Revoir les opportunités",
    message: "Consultez les opportunités locales et choisissez une piste à tester en Afrique Centrale.",
    delayHours: 72,
    icon: <Compass size={16} />
  },
];

export default function Reminders({
  reminders,
  onBack,
  onAddReminder,
  onMarkDone,
  onDeleteReminder
}: RemindersProps) {
  
  const pending = reminders.filter(r => !r.done_at);
  const completed = reminders.filter(r => r.done_at);

  const formatDue = (ts: number) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(ts));
  };

  return (
    <div className="flex flex-col h-full bg-surface-main select-none">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-ter bg-white select-none">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
          <ArrowLeft size={20} className="text-text-main" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-text-main">Rappels</h2>
          <p className="text-xs text-text-ter">{pending.length} rappel(s) actif(s)</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
        
        {/* Intro Banner */}
        <div className="bg-brand-tertiary text-on-brand-tertiary p-4 rounded-eclosion border border-brand-primary/10 select-none">
          <h3 className="text-xs font-semibold flex items-center gap-1.5">
            <Bell size={14} className="text-brand-primary" />
            Planifier une action
          </h3>
          <p className="text-[11px] opacity-90 leading-relaxed mt-1">
            Les rappels s'affichent sous forme de notifications ou d'alertes rutilantes au sein de la plateforme une fois l'échéance atteinte.
          </p>
        </div>

        {/* Presets Grid */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-text-ter tracking-wider mb-0.5 select-none">
            Raccourcis de planification
          </h4>

          <div className="flex flex-col gap-2.5">
            {PRESETS.map((p, idx) => (
              <div
                key={idx}
                className="bg-white border border-surface-ter p-3.5 rounded-eclosion flex items-center gap-3.5 shadow-sm select-none"
              >
                <div className="w-10 h-10 rounded-full bg-brand-tertiary flex items-center justify-center text-brand-primary border border-surface-ter shrink-0">
                  {p.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-text-main leading-tight truncate">{p.title}</h4>
                  <p className="text-[10px] text-text-ter leading-tight mt-0.5">Dans {p.delayHours / 24} jour(s)</p>
                  <p className="text-[10px] text-text-sec leading-snug line-clamp-1 mt-1">{p.message}</p>
                </div>

                <button
                  onClick={() => onAddReminder(p.kind, p.title, p.message, p.delayHours)}
                  className="w-8 h-8 rounded-full bg-brand-primary hover:bg-brand-primary/95 text-white flex items-center justify-center transition-all active:scale-90 shadow-sm shrink-0"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Active Reminders List */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold text-brand-primary tracking-wider mb-0.5 select-none">
            Tâches actives ({pending.length})
          </h4>

          {pending.length === 0 ? (
            <p className="text-xs text-text-ter text-center py-6 border-2 border-dashed border-surface-ter rounded-eclosion italic select-none">
              Aucun rappel planifié. Utilisez un raccourci ci-dessus !
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {pending.map((r) => (
                <div
                  key={r.reminder_id}
                  className="bg-surface-sec border border-surface-ter p-3.5 rounded-eclosion flex items-start gap-3 shadow-sm select-none"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-tertiary text-brand-secondary flex items-center justify-center shrink-0 border border-surface-ter">
                    <Bell size={14} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-text-main leading-snug truncate">{r.title}</h4>
                    <p className="text-[10px] text-text-sec leading-normal mt-0.5 line-clamp-2 select-text">{r.message}</p>
                    <div className="flex items-center gap-1 mt-2.5 text-[9px] text-[#4A5D6B] font-semibold select-none">
                      <Calendar size={10} />
                      <span>Échéance : {formatDue(r.due_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0 select-none">
                    <button
                      onClick={() => onMarkDone(r.reminder_id)}
                      className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 border border-green-200 text-success-main flex items-center justify-center transition-all active:scale-90"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteReminder(r.reminder_id)}
                      className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-error-main flex items-center justify-center transition-all active:scale-90"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Reminders */}
        {completed.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-text-ter tracking-wider mb-0.5 select-none">
              Tâches terminées ({completed.length})
            </h4>

            <div className="flex flex-col gap-2.5 select-none">
              {completed.map((r) => (
                <div
                  key={r.reminder_id}
                  className="bg-white border border-surface-ter opacity-60 p-3 rounded-eclosion flex items-center gap-3 shadow-sm select-none"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-tertiary text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/5">
                    <Check size={12} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-text-main truncate line-through leading-tight">{r.title}</h4>
                    <span className="text-[9px] text-text-ter block mt-0.5">Terminée</span>
                  </div>

                  <button
                    onClick={() => onDeleteReminder(r.reminder_id)}
                    className="w-7 h-7 rounded-full hover:bg-red-50 text-text-ter hover:text-error-main flex items-center justify-center transition-all active:scale-90"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
