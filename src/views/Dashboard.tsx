import React from "react";
import { 
  ArrowLeft, 
  CheckCircle, 
  Activity, 
  Star, 
  Bell, 
  BookOpen, 
  Users, 
  Search, 
  FileText, 
  DownloadCloud, 
  ChevronRight, 
  Calendar, 
  Sparkles 
} from "lucide-react";
import { motion } from "motion/react";
import { User, FundingRequest, LocalReminder, FavoriteItem } from "../types";

interface DashboardProps {
  user: User;
  group: any;
  completedCount: number;
  totalModules: number;
  downloadedCount: number;
  favorites: FavoriteItem[];
  reminders: LocalReminder[];
  pitches: FundingRequest[];
  onBack: () => void;
  onNavigate: (tab: string) => void;
  onNavigateToView: (view: string) => void;
}

export default function Dashboard({
  user,
  group,
  completedCount,
  totalModules,
  downloadedCount,
  favorites,
  reminders,
  pitches,
  onBack,
  onNavigate,
  onNavigateToView,
}: DashboardProps) {
  
  const activeRemindersCount = reminders.filter(r => !r.done_at).length;
  const progressPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  // Onboarding steps check
  const checklist = [
    {
      id: "group",
      title: "Créer ou rejoindre un groupe",
      desc: group ? `${group.name} • ${group.members?.length || 1} membres` : "Commencez par collaborer en coopérative.",
      status: group ? "termine" : "en_cours",
      tab: "groupe",
      icon: <Users size={16} />
    },
    {
      id: "training",
      title: "Terminer un module de formation",
      desc: completedCount > 0 ? `${completedCount} module(s) validé(s)` : "Ouvrez un cours et marquez-le comme lu.",
      tab: "formations",
      status: completedCount > 0 ? "termine" : "en_cours",
      icon: <BookOpen size={16} />
    },
    {
      id: "favorite",
      title: "Ajouter un favori de référence",
      desc: favorites.length > 0 ? `${favorites[0].title}` : "Sauvegardez un bailleur ou un projet important.",
      view: "favorites",
      status: favorites.length > 0 ? "termine" : "en_cours",
      icon: <Star size={16} />
    },
    {
      id: "reminder",
      title: "Planifier une tâche de suivi",
      desc: reminders.length > 0 ? `${activeRemindersCount} rappel(s) programmés` : "Planifiez un rendez-vous pour votre coopérative.",
      view: "reminders",
      status: reminders.length > 0 ? "termine" : "en_cours",
      icon: <Bell size={16} />
    },
    {
      id: "pitch",
      title: "Générer un pitch de financement",
      desc: pitches.length > 0 ? pitches[0].project_name : "Utilisez notre assistant IA pour formaliser vos besoins.",
      tab: "financement",
      status: pitches.length > 0 ? "termine" : "en_cours",
      icon: <FileText size={16} />
    }
  ];

  const onboardingDone = checklist.filter(c => c.status === "termine").length;
  const onboardingPercent = Math.round((onboardingDone / checklist.length) * 100);

  return (
    <div className="flex flex-col h-full bg-surface-main">
      {/* Top Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-ter bg-white select-none">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
          <ArrowLeft size={20} className="text-text-main" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-semibold text-text-main">Mon tableau de bord</h2>
            <span className="text-[9px] px-1.5 py-0.5 bg-[#7B3FF2]/10 text-[#7B3FF2] font-mono font-bold rounded">AFEP-3.0</span>
          </div>
          <p className="text-xs text-text-ter">Suivi d'intégration sous l'égide de l'AFEP-3.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
        {/* Progress Card */}
        <div className="bg-surface-inv rounded-eclosion p-5 text-white shadow-sm">
          <span className="text-xs text-brand-secondary font-semibold tracking-wider block mb-1">
            Progression personnelle
          </span>
          <h3 className="text-2xl font-bold tracking-tight">
            {completedCount}/{totalModules} cours terminés
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-normal">
            {activeRemindersCount} rappels planifiés • {favorites.length} favoris sauvegardés • {downloadedCount} modules consultables hors ligne.
          </p>

          <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-brand-secondary h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Start Checklist */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-base font-semibold text-text-main">Checklist de démarrage</h4>
            <span className="text-xs font-mono font-bold text-brand-primary bg-brand-tertiary px-2 py-0.5 rounded-full">
              {onboardingDone}/{checklist.length}
            </span>
          </div>

          <div className="bg-surface-sec p-4 rounded-eclosion flex items-center justify-between shadow-sm">
            <div className="flex-1">
              <span className="text-xs text-text-ter block">Pourcentage d'intégration</span>
              <span className="text-lg font-bold text-text-main block">{onboardingPercent}% complété</span>
              <div className="w-full bg-surface-ter h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-brand-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${onboardingPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mt-1">
            {checklist.map((step) => (
              <button
                key={step.id}
                onClick={() => {
                  if (step.tab) onNavigate(step.tab);
                  else if (step.view) onNavigateToView(step.view);
                }}
                className="w-full flex items-center gap-3 bg-white border border-surface-ter hover:border-brand-primary/30 p-3 rounded-eclosion text-left transition-all hover:bg-surface-sec/30 active:scale-[0.99] shadow-sm"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === "termine" ? "bg-brand-primary text-white" : "bg-brand-tertiary text-brand-primary"
                }`}>
                  {step.status === "termine" ? <CheckCircle size={16} /> : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-text-main truncate">{step.title}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      step.status === "termine" ? "bg-brand-tertiary text-brand-primary" : "bg-surface-ter text-text-ter"
                    }`}>
                      {step.status === "termine" ? "Fait" : "À faire"}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-ter truncate leading-tight">{step.desc}</p>
                </div>
                <ChevronRight size={14} className="text-text-ter shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions Band */}
        <div>
          <h4 className="text-base font-semibold text-text-main mb-3">Actions rapides</h4>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => onNavigateToView("search")}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-brand-tertiary/40 border border-surface-ter hover:border-brand-primary/30 rounded-eclosion text-center transition-all hover:bg-brand-tertiary/70 active:scale-[0.97]"
            >
              <Search size={18} className="text-brand-primary" />
              <span className="text-[11px] font-medium text-text-sec">Rechercher</span>
            </button>
            <button 
              onClick={() => onNavigate("financement")}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-brand-tertiary border border-brand-secondary/10 hover:border-brand-secondary/30 rounded-eclosion text-center transition-all hover:bg-brand-tertiary/80 active:scale-[0.97]"
            >
              <FileText size={18} className="text-brand-secondary" />
              <span className="text-[11px] font-medium text-text-sec">Nouveau pitch</span>
            </button>
            <button 
              onClick={() => onNavigateToView("reminders")}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-brand-tertiary/30 border border-surface-ter hover:border-brand-secondary/30 rounded-eclosion text-center transition-all hover:bg-brand-tertiary/50 active:scale-[0.97]"
            >
              <Bell size={18} className="text-brand-secondary" />
              <span className="text-[11px] font-medium text-text-sec">Rappels</span>
            </button>
          </div>
        </div>

        {/* Latest Pitch Generates */}
        <div>
          <h4 className="text-base font-semibold text-text-main mb-3">Dernier plan de financement</h4>
          {pitches.length > 0 ? (
            <div className="bg-surface-sec p-4 rounded-eclosion border border-surface-ter shadow-sm flex items-start gap-3">
              <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-full shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-brand-secondary font-semibold tracking-wider block">
                  AI pitch • {pitches[0].sector}
                </span>
                <h5 className="text-sm font-semibold text-text-main mt-0.5 truncate">
                  {pitches[0].project_name}
                </h5>
                <p className="text-xs text-text-ter leading-normal mt-1 block line-clamp-2">
                  {pitches[0].pitch.replace(/##\s+/g, "").replace(/\n/g, " ").substring(0, 150)}...
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-text-ter">
                  <Calendar size={11} />
                  <span>
                    Rédigé le {new Date(pitches[0].created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short"
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-surface-ter p-6 rounded-eclosion text-center text-text-ter">
              <FileText size={24} className="opacity-30 mx-auto mb-2" />
              <p className="text-xs font-semibold">Aucun plan d'affaires rédigé</p>
              <p className="text-[10px] max-w-[220px] mx-auto mt-1 leading-normal">
                Utilisez l'onglet "Financement" pour générer votre premier pitch d'affaires rutilant.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
