import React, { useState } from "react";
import { apiFetch } from "../api";
import { 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Sparkles, 
  Download, 
  Plus, 
  Users, 
  FileText, 
  ChevronRight,
  ClipboardCheck,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";
import { FundingRequest } from "../types";

const STEPS = [
  { key: "project_name", label: "Comment s'appelle votre projet ?", placeholder: "Ex: Coopérative de transformation du manioc" },
  { key: "sector", label: "Dans quel secteur ?", placeholder: "Agriculture, Artisanat, Élevage, Commerce..." },
  { key: "problem", label: "Quel problème résolvez-vous ?", placeholder: "Ex: Le manioc frais commence à pourrir sous 48h s'il n'est pas pressé et séché au village.", multiline: true },
  { key: "solution", label: "Quelle est votre solution ?", placeholder: "Ex: Acheter une presse collective pour sécher et faire de la farine de manioc pure.", multiline: true },
  { key: "beneficiaries", label: "Qui en bénéficiera ?", placeholder: "Ex: 15 femmes de la coopérative maraîchère" },
  { key: "target_amount", label: "Quel montant recherchez-vous ?", placeholder: "Ex: 500 000 FCFA" },
];

interface FinancementProps {
  pitches: FundingRequest[];
  onGeneratePitch: (inputs: any) => Promise<void>;
  onNavigateToView: (view: string) => void;
  onNavigate: (tab: string) => void;
}

export default function Financement({
  pitches,
  onGeneratePitch,
  onNavigateToView,
  onNavigate,
}: FinancementProps) {
  
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({
    project_name: "",
    sector: "",
    problem: "",
    solution: "",
    beneficiaries: "",
    target_amount: ""
  });
  
  const [generating, setGenerating] = useState(false);
  const [selectedPitch, setSelectedRequest] = useState<FundingRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step];
  const total = STEPS.length;
  const value = data[current.key] || "";

  const handleNext = async () => {
    if (!value.trim()) return;
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setGenerating(true);
      setError(null);
      try {
        await onGeneratePitch(data);
        // Set most recent pitch
        const updatedRes = await apiFetch(`/api/funding/mine`);
        if (updatedRes.ok) {
          const items = await updatedRes.json();
          if (items.length > 0) {
            setSelectedRequest(items[0]);
          }
        }
      } catch (err) {
        setError("La génération a échoué. Veuillez vérifier l'état du serveur.");
      } finally {
        setGenerating(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setData({
      project_name: "",
      sector: "",
      problem: "",
      solution: "",
      beneficiaries: "",
      target_amount: ""
    });
    setSelectedRequest(null);
    setError(null);
  };

  const handlePdfDownload = () => {
    if (!selectedPitch) return;
    alert(`Téléchargement du PDF pour "${selectedPitch.project_name}" simulé de manière sécurisée !`);
  };

  // If loading AI generating state
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-full text-center bg-surface-main">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-brand-primary mb-4"
        >
          <Zap size={48} className="fill-brand-secondary stroke-none" />
        </motion.div>
        <h2 className="text-lg font-bold text-text-main">
          L'IA rédige votre plan d'affaires...
        </h2>
        <p className="text-xs text-text-ter max-w-[240px] mt-2 leading-relaxed">
          Notre assistant intelligent rassemble vos informations pour formuler un pitch de financement rutilant d'Afrique Centrale.
        </p>
      </div>
    );
  }

  // If a pitch is completed and shown
  if (selectedPitch) {
    return (
      <div className="flex flex-col h-full bg-surface-main">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-ter bg-white select-none">
          <button onClick={handleReset} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
            <ArrowLeft size={20} className="text-text-main" />
          </button>
          <h2 className="text-base font-semibold text-text-main truncate">Votre plan d'affaires</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
          <div className="bg-brand-tertiary text-on-brand-tertiary p-4 rounded-eclosion border border-brand-primary/10 flex items-start gap-3">
            <Sparkles size={18} className="text-brand-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold block">Félicitations !</span>
              <p className="text-[11px] opacity-90 leading-relaxed mt-0.5">
                Le document ci-dessous a été structuré par notre assistant. Il est formaté pour satisfaire les critères des comités de crédit locaux.
              </p>
            </div>
          </div>

          <div className="bg-white border border-surface-ter p-5 rounded-eclosion shadow-sm text-xs text-text-sec space-y-4 font-sans leading-relaxed select-text">
            {/* Parse basic markdown styling on the fly */}
            {selectedPitch.pitch.split("\n\n").map((para, i) => {
              if (para.startsWith("## ")) {
                return (
                  <h3 key={i} className="text-sm font-bold text-brand-primary border-b border-surface-ter pb-1 pt-2">
                    {para.replace("## ", "")}
                  </h3>
                );
              }
              if (para.startsWith("* ")) {
                return (
                  <ul key={i} className="list-disc pl-4 space-y-1">
                    {para.split("\n").map((li, j) => (
                      <li key={j}>{li.replace("* ", "")}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{para}</p>;
            })}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePdfDownload}
              className="w-full bg-brand-secondary hover:bg-brand-secondary/95 text-white py-3.5 px-6 rounded-eclosion font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Télécharger le document PDF
            </button>

            <button
              onClick={handleReset}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white py-3.5 px-6 rounded-eclosion font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Nouveau projet collectif
            </button>

            <button
              onClick={() => onNavigateToView("donors")}
              className="w-full bg-surface-sec hover:bg-surface-ter text-brand-primary py-3.5 px-6 rounded-eclosion font-bold text-sm border border-brand-primary/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Users size={16} />
              Consulter l'annuaire des bailleurs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-main">
      {/* Wizard Header */}
      <div className="px-6 py-4 bg-white border-b border-surface-ter select-none">
        <h2 className="text-xl font-bold text-text-main">Financement</h2>
        <p className="text-xs text-text-ter leading-snug mt-0.5">
          Étape {step + 1} sur {total}
        </p>

        <div className="w-full bg-surface-ter h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-brand-primary h-full rounded-full transition-all duration-300" 
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Main wizard question body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-text-main leading-snug">
            {current.label}
          </h3>
          <p className="text-xs text-text-ter mt-1">
            Donnez des informations précises pour obtenir un meilleur plan d'affaires rédigé par l'IA.
          </p>
        </div>

        <div>
          {current.multiline ? (
            <textarea
              required
              rows={4}
              value={value}
              onChange={(e) => setData({ ...data, [current.key]: e.target.value })}
              placeholder={current.placeholder}
              className="w-full px-4 py-3 bg-surface-sec border border-surface-ter text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all text-sm resize-none shadow-sm leading-relaxed"
            />
          ) : (
            <input
              type="text"
              required
              value={value}
              onChange={(e) => setData({ ...data, [current.key]: e.target.value })}
              placeholder={current.placeholder}
              className="w-full px-4 py-3 bg-surface-sec border border-surface-ter text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all text-sm shadow-sm"
            />
          )}
          {error && <span className="text-xs text-error-main mt-2 block">{error}</span>}
        </div>

        {/* Directory Access Banner */}
        {step === 0 && (
          <button
            onClick={() => onNavigateToView("donors")}
            className="bg-surface-sec border border-surface-ter p-4 rounded-eclosion flex items-center gap-4 text-left shadow-sm hover:border-brand-secondary/20 transition-all active:scale-[0.99] mt-2 select-none"
          >
            <div className="w-10 h-10 rounded-full bg-brand-secondary text-white flex items-center justify-center shrink-0 border border-surface-ter">
              <Users size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-text-main">Annuaire des bailleurs</h4>
              <p className="text-xs text-text-ter mt-0.5 truncate leading-tight">
                Consultez 26 ONG, microfinances et aides gouvernementales.
              </p>
            </div>
            <ChevronRight size={18} className="text-text-ter shrink-0" />
          </button>
        )}

        {/* Pitch history list */}
        {pitches.length > 0 && step === 0 && (
          <div className="mt-4 flex flex-col gap-2.5">
            <h4 className="text-xs font-semibold text-text-ter tracking-wider">
              Vos projets enregistrés
            </h4>

            {pitches.map((req) => (
              <button
                key={req.request_id}
                onClick={() => setSelectedRequest(req)}
                className="w-full bg-white border border-surface-ter p-3 rounded-eclosion flex items-center gap-3 text-left shadow-sm transition-all hover:bg-surface-sec/30 active:scale-[0.99]"
              >
                <FileText size={16} className="text-brand-primary shrink-0" />
                <span className="flex-1 text-xs font-semibold text-text-main truncate">
                  {req.project_name}
                </span>
                <ChevronRight size={14} className="text-text-ter shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="px-6 py-4 border-t border-surface-ter bg-white flex gap-3 select-none">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="w-12 h-12 bg-surface-sec hover:bg-surface-ter text-brand-primary rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={!value.trim()}
          className={`flex-1 h-12 rounded-full font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            value.trim() 
              ? "bg-brand-primary hover:bg-brand-primary/95 text-white" 
              : "bg-surface-ter text-text-ter cursor-not-allowed"
          }`}
        >
          <span>{step < total - 1 ? "Suivant" : "Générer mon pitch IA"}</span>
          {step < total - 1 ? <ArrowRight size={14} /> : <Zap size={14} className="fill-white stroke-none" />}
        </button>
      </div>

    </div>
  );
}
