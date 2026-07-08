import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Phone, 
  ExternalLink, 
  MessageCircle, 
  Send, 
  CheckCircle, 
  X, 
  CheckSquare, 
  Clock, 
  XCircle, 
  Plus,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { Donor, FavoriteItem, Review } from "../types";

interface BailleursProps {
  donors: Donor[];
  favorites: FavoriteItem[];
  onToggleFavorite: (item: any) => void;
  onBack: () => void;
  onRateDonor: (donorId: string, stars: number, outcome: string, comment: string) => Promise<void>;
}

const COUNTRIES = [
  "Tous",
  "Cameroun",
  "Gabon",
  "RDC",
  "RCA",
  "Congo",
  "Tchad",
  "Guinée Équatoriale"
];

const OUTCOMES = [
  { key: "no_response", label: "Pas de réponse", icon: <Clock size={14} /> },
  { key: "responded", label: "A répondu", icon: <MessageCircle size={14} /> },
  { key: "funded", label: "Projet financé", icon: <CheckCircle size={14} className="text-success-main" /> },
  { key: "rejected", label: "Refusé", icon: <XCircle size={14} className="text-error-main" /> },
];

const OUTCOME_LABELS: Record<string, string> = {
  no_response: "Pas de réponse",
  responded: "A répondu",
  funded: "Projet financé",
  rejected: "Refusé"
};

const TYPE_COLORS: Record<string, { bg: string, text: string }> = {
  "ONG internationale": { bg: "bg-[#EAF0F4]", text: "text-[#4A5D6B]" },
  "ONG locale": { bg: "bg-[#EAF0F4]", text: "text-[#4A5D6B]" },
  "Microfinance": { bg: "bg-brand-tertiary/60", text: "text-brand-secondary" },
  "Programme gouvernemental": { bg: "bg-[#E8F0E8]", text: "text-brand-primary" },
  "Banque publique": { bg: "bg-green-50", text: "text-[#3D734B]" },
};

export default function Bailleurs({
  donors,
  favorites,
  onToggleFavorite,
  onBack,
  onRateDonor
}: BailleursProps) {
  
  const [selectedCountry, setSelectedCountry] = useState("Tous");
  const [ratingDonor, setRatingDonor] = useState<Donor | null>(null);
  const [reviewsState, setReviewsState] = useState<{ reviews: Review[], avg: number, count: number } | null>(null);
  const [loadingReviews, setLoadingLoadingReviews] = useState(false);

  // New review form states
  const [formStars, setFormStars] = useState(5);
  const [formOutcome, setFormOutcome] = useState("funded");
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredDonors = selectedCountry === "Tous" 
    ? donors 
    : donors.filter(d => d.country === selectedCountry);

  const isDonorFav = (id: string) => favorites.some(f => f.kind === "donor" && f.id === id);

  const handleFavoriteClick = (d: Donor) => {
    onToggleFavorite({
      id: d.donor_id,
      kind: "donor",
      title: d.name,
      subtitle: `${d.city}, ${d.country}`,
      description: d.description,
      href: "/donors"
    });
  };

  const handleOpenRating = async (d: Donor) => {
    setRatingDonor(d);
    setLoadingLoadingReviews(true);
    setFormStars(5);
    setFormOutcome("funded");
    setFormComment("");
    setSuccess(false);
    
    try {
      const res = await fetch(`/api/donors/${d.donor_id}/reviews`);
      if (res.ok) {
        const rData = await res.json();
        setReviewsState(rData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLoadingReviews(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingDonor) return;
    setSubmitting(true);
    try {
      await onRateDonor(ratingDonor.donor_id, formStars, formOutcome, formComment);
      setSuccess(true);
      // Reload reviews log
      const res = await fetch(`/api/donors/${ratingDonor.donor_id}/reviews`);
      if (res.ok) {
        const rData = await res.json();
        setReviewsState(rData);
      }
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-main relative select-none">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-ter bg-white select-none">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
          <ArrowLeft size={20} className="text-text-main" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-text-main">Bailleurs de fonds</h2>
          <p className="text-xs text-text-ter">{filteredDonors.length} contacts d'aides locales</p>
        </div>
      </div>

      {/* Country Filters Row */}
      <div className="border-b border-surface-ter bg-white py-3 px-6 flex items-center gap-2 overflow-x-auto select-none shrink-0 no-scrollbar">
        {COUNTRIES.map((c) => {
          const active = c === selectedCountry;
          return (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                active 
                  ? "bg-brand-primary text-white" 
                  : "bg-surface-sec text-text-sec border border-surface-ter hover:bg-surface-ter/50"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Donors List area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
        {filteredDonors.length === 0 ? (
          <div className="text-center text-text-ter p-8 border-2 border-dashed border-surface-ter rounded-eclosion">
            <Users size={24} className="opacity-30 mx-auto mb-2" />
            <p className="text-xs">Aucun bailleur référencé pour ce pays.</p>
          </div>
        ) : (
          filteredDonors.map((d) => {
            const isFav = isDonorFav(d.donor_id);
            const badge = TYPE_COLORS[d.type] || { bg: "bg-surface-sec", text: "text-text-main" };
            
            return (
              <div 
                key={d.donor_id}
                className="bg-surface-sec border border-surface-ter rounded-eclosion p-4 flex flex-col gap-3 shadow-sm hover:border-brand-primary/10 transition-all select-none text-left"
              >
                <div className="flex justify-between items-start gap-2 select-none">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider ${badge.bg} ${badge.text}`}>
                    {d.type}
                  </span>
                  
                  <div className="flex items-center gap-1.5 shrink-0 text-text-ter text-[10px] font-semibold">
                    <MapPin size={11} className="text-brand-primary" />
                    <span>{d.city}</span>
                  </div>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-sm font-bold text-text-main leading-snug">{d.name}</h4>
                  <button 
                    onClick={() => handleFavoriteClick(d)}
                    className="p-1 hover:text-brand-secondary transition-all shrink-0"
                  >
                    <Star size={15} fill={isFav ? "#D98A2C" : "none"} className={isFav ? "text-brand-secondary" : "text-text-ter"} />
                  </button>
                </div>

                <p className="text-xs text-text-sec leading-relaxed select-text">{d.description}</p>

                <div className="flex items-center gap-1">
                  {d.sectors.map((s) => (
                    <span 
                      key={s} 
                      className="text-[9px] bg-brand-tertiary text-on-brand-tertiary px-1.5 py-0.5 rounded font-medium border border-brand-primary/5 shrink-0"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-1 text-[11px] text-text-ter font-medium select-none">
                  <Star size={11} fill="#D98A2C" className="text-brand-secondary" />
                  <span>
                    {d.avg_rating > 0 
                      ? `${d.avg_rating.toFixed(1)} / 5 • ${d.rating_count} avis communautaires`
                      : "Aucun avis • Soyez la première à noter"}
                  </span>
                </div>

                {/* Direct Actions */}
                <div className="grid grid-cols-3 gap-2 border-t border-surface-ter pt-3 mt-1 select-none">
                  <a 
                    href={`tel:${d.phone}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-full text-[11px] font-semibold transition-all active:scale-[0.97]"
                  >
                    <Phone size={11} />
                    Appeler
                  </a>
                  
                  <a 
                    href={d.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-brand-primary/20 hover:bg-surface-sec text-brand-primary rounded-full text-[11px] font-semibold transition-all active:scale-[0.97]"
                  >
                    <ExternalLink size={11} />
                    Site web
                  </a>

                  <button 
                    onClick={() => handleOpenRating(d)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-tertiary/60 hover:bg-brand-tertiary/80 border border-brand-secondary/20 text-brand-secondary rounded-full text-[11px] font-semibold transition-all active:scale-[0.97]"
                  >
                    <Star size={11} />
                    Noter
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ratings Bottom Sheet Mockup */}
      {ratingDonor && (
        <div className="absolute inset-0 bg-black/60 z-50 flex flex-col justify-end select-none animate-fadeIn">
          {/* Backdrop Closer */}
          <div className="flex-1 w-full" onClick={() => setRatingDonor(null)} />
          
          <div className="bg-white rounded-t-[24px] max-h-[90%] overflow-y-auto px-6 py-5 flex flex-col gap-5 border-t border-surface-ter">
            
            {/* Sheet Title Bar */}
            <div className="flex justify-between items-center border-b border-surface-ter pb-3 select-none">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider block">Notation communautaire</span>
                <h3 className="text-sm font-bold text-text-main truncate leading-tight">{ratingDonor.name}</h3>
              </div>
              <button 
                onClick={() => setRatingDonor(null)}
                className="p-1.5 bg-surface-sec hover:bg-surface-ter rounded-full transition-all shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* If rating submitted successfully */}
            {success ? (
              <div className="bg-brand-tertiary border border-brand-primary/20 text-on-brand-tertiary p-4 rounded-eclosion text-center flex flex-col items-center gap-2 py-6">
                <CheckCircle size={32} className="text-brand-primary animate-bounce" />
                <span className="text-sm font-bold">Votre avis a bien été publié !</span>
                <p className="text-xs opacity-90 leading-relaxed">
                  Merci de partager votre expérience. Elle guidera les autres coopératives rutilantes d'Afrique Centrale dans leurs démarches de financement.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4 select-none">
                {/* 1. Star Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-main block">1. Donnez une note globale</label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormStars(star)}
                        className="text-brand-secondary hover:scale-110 transition-transform"
                      >
                        <Star size={24} fill={star <= formStars ? "#D98A2C" : "none"} />
                      </button>
                    ))}
                    <span className="text-xs text-text-ter ml-1">({formStars}/5)</span>
                  </div>
                </div>

                {/* 2. Outcome selections */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-main block">2. Quel a été le résultat de votre contact ?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {OUTCOMES.map((o) => {
                      const active = o.key === formOutcome;
                      return (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => setFormOutcome(o.key)}
                          className={`flex items-center gap-2 p-2.5 rounded-eclosion border text-left transition-all ${
                            active 
                              ? "bg-brand-primary text-white border-brand-primary" 
                              : "bg-surface-sec text-text-sec border-surface-ter hover:bg-surface-ter"
                          }`}
                        >
                          <span className={active ? "text-white" : "text-brand-primary"}>{o.icon}</span>
                          <span className="text-xs font-medium leading-none">{o.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Text comment */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-text-main block">3. Décrivez votre expérience (optionnel)</label>
                  <textarea
                    rows={2}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Délais de réponse, accueil, documents demandés, conseils..."
                    className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all resize-none shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-eclosion shadow-md transition-all active:scale-[0.98]"
                >
                  {submitting ? "Publication en cours..." : "Publier mon avis"}
                </button>
              </form>
            )}

            {/* Other reviews log */}
            <div className="border-t border-surface-ter pt-4 flex-1">
              <h4 className="text-xs font-semibold text-text-ter tracking-wider mb-3">Avis de la communauté</h4>
              {loadingReviews ? (
                <div className="flex justify-center p-4">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !reviewsState || reviewsState.reviews.length === 0 ? (
                <p className="text-xs text-text-ter text-center py-4 italic">Aucun avis rédigé pour le moment. Soyez la première !</p>
              ) : (
                <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 select-text">
                  {reviewsState.reviews.map((r, i) => (
                    <div key={i} className="bg-surface-sec border border-surface-ter p-3 rounded-eclosion text-xs space-y-1 shadow-sm">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-text-main block">{r.user_name}</span>
                        <div className="flex gap-0.5 text-brand-secondary">
                          {Array.from({ length: r.stars }).map((_, idx) => (
                            <Star key={idx} size={8} fill="#D98A2C" className="text-brand-secondary" />
                          ))}
                        </div>
                      </div>
                      <span className="inline-block text-[9px] font-semibold text-brand-primary bg-white px-2 py-0.5 rounded-full border border-surface-ter">
                        {OUTCOME_LABELS[r.outcome] || r.outcome}
                      </span>
                      {r.comment && <p className="text-text-sec italic leading-relaxed">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
