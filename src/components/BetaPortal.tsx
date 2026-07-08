import React, { useState, useEffect } from "react";
import { 
  Download, 
  CheckCircle, 
  ArrowLeft,
  Send, 
  Users, 
  Smartphone, 
  QrCode, 
  CheckSquare, 
  MessageSquare, 
  Star 
} from "lucide-react";
import { TesterFeedback } from "../types";
import { apiFetch } from "../api";

interface BetaPortalProps {
  onBack: () => void;
}

export default function BetaPortal({ onBack }: BetaPortalProps) {
  const [feedbacks, setFeedbacks] = useState<TesterFeedback[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
    role: "Leader Bafia (Cameroun)"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadFeedbacks = async () => {
    try {
      const res = await apiFetch("/api/tester-feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/tester-feedback", {
        method: "POST",
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({
          name: "",
          email: "",
          rating: 5,
          comment: "",
          role: "Leader Bafia (Cameroun)"
        });
        setSuccess(true);
        loadFeedbacks();
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-surface-main flex flex-col overflow-hidden">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-ter bg-white select-none shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
          <ArrowLeft size={20} className="text-text-main" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-text-main">Espace Bêta-Test</h2>
          <p className="text-xs text-text-ter">Recueil de retours d'expérience en direct</p>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6 pb-24">
        {/* Portal Info Panel */}
        <div className="w-full bg-brand-tertiary/30 border border-brand-primary/10 rounded-eclosion p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-eclosion">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-main">
                Campagne de validation bêta
              </h3>
              <p className="text-xs text-text-ter font-mono">
                10 leaders de coopératives rutilantes • Terrain & Hors-ligne
              </p>
            </div>
          </div>
          <p className="text-xs text-text-sec leading-relaxed">
            Cet espace permet de tester l'application en conditions réelles, de simuler l'installation de l'APK mobile et de recueillir directement les retours par mail et base de données sécurisée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Block: Direct Download Simulator & Checklist */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-surface-ter rounded-eclosion p-5 shadow-sm">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                <Download size={16} className="text-brand-secondary" />
                Lien de téléchargement sécurisé
              </h3>
              <p className="text-xs text-text-sec leading-relaxed mb-4">
                Installez l'application mobile autonome rutilante directement sur le terrain sans passer par Google Play Store :
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center bg-surface-sec p-4 rounded-eclosion border border-surface-ter">
                <div className="p-2.5 bg-white border border-surface-ter rounded-eclosion shadow-sm">
                  <div className="w-20 h-20 bg-brand-primary/10 flex flex-col items-center justify-center text-brand-primary gap-1">
                    <QrCode size={36} />
                    <span className="text-[8px] font-mono font-bold tracking-widest text-center">BÉTA 1.0</span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <span className="text-[10px] tracking-wider font-bold text-brand-secondary block mb-1">
                    Android APK autonome
                  </span>
                  <h4 className="text-xs font-bold text-text-main mb-0.5">
                    eclosion-beta-v1.0.apk
                  </h4>
                  <p className="text-[10px] text-text-ter mb-3 font-mono">
                    SHA-256 certifié • 18.4 Mo
                  </p>
                  <button
                    onClick={() => {
                      alert("Fichier APK autonome simulé : L'application mobile autonome est prête à être déployée auprès de vos 10 leaders de coopératives !");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-medium text-xs rounded-eclosion transition-all shadow-sm active:scale-95"
                  >
                    <Download size={12} />
                    Télécharger l'APK
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-surface-ter pt-3">
                <span className="text-xs font-bold text-text-main block mb-1.5">
                  Installation simplifiée :
                </span>
                <ul className="text-[11px] text-text-sec space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li>
                    <strong className="text-brand-primary">Android :</strong> Ouvrez l'APK et autorisez l'installation d'applications de sources tierces.
                  </li>
                  <li>
                    <strong className="text-brand-primary">En ligne (PWA) :</strong> Ouvrez l'adresse de l'app sur mobile et cliquez sur <strong className="text-text-main">"Ajouter à l'écran d'accueil"</strong> pour l'utiliser hors réseau !
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-surface-ter rounded-eclosion p-5 shadow-sm">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                <CheckSquare size={16} className="text-brand-primary" />
                Parcours d'évaluation conseillé
              </h3>
              <p className="text-xs text-text-sec leading-relaxed mb-4">
                Pour tester l'ensemble du cycle de l'application, suivez ces étapes :
              </p>

              <div className="space-y-3">
                {[
                  "Inscrire un vrai compte sur l'écran d'accueil personnalisé",
                  "Créer une vraie coopérative dans l'onglet 'Mon Groupe'",
                  "Suivre et valider un cours avec le quiz interactif (Formations)",
                  "Publier un mot d'accueil rutilant dans le chat de groupe",
                  "Générer votre pitch d'affaires personnalisé grâce à l'IA (Financement)",
                  "Noter un bailleur de fonds qui vous a soutenu (Annuaire Bailleurs)"
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-brand-tertiary flex items-center justify-center text-brand-primary flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <span className="text-xs text-text-sec leading-tight pt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Block: Feedback Form & Live Feedbacks Log */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-surface-ter rounded-eclosion p-5 shadow-sm">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                <MessageSquare size={16} className="text-brand-primary" />
                Soumettre un retour de test
              </h3>
              
              {success ? (
                <div className="bg-brand-tertiary border border-brand-primary/20 text-brand-primary p-4 rounded-eclosion text-center flex flex-col items-center gap-2">
                  <CheckCircle size={28} className="text-brand-primary animate-bounce" />
                  <span className="text-xs font-bold">
                    Votre avis précieux a été enregistré !
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Les retours sont immédiatement stockés de façon sécurisée dans la base Éclosion et lisibles par l'équipe.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-sec block mb-1">Nom complet</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ex: Mireille Mballa"
                        className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-sec block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Ex: mballa@gmail.com"
                        className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-sec block mb-1">Rôle / Région</label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                      >
                        <option value="Leader Bafia (Cameroun)">Leader Bafia (Cameroun)</option>
                        <option value="Maraîchère Yaoundé (Cameroun)">Maraîchère Yaoundé (Cameroun)</option>
                        <option value="Artisane Pointe-Noire (Congo)">Artisane Pointe-Noire (Congo)</option>
                        <option value="Apicultrice Oyem (Gabon)">Apicultrice Oyem (Gabon)</option>
                        <option value="Coopérative Bangui (RCA)">Coopérative Bangui (RCA)</option>
                        <option value="Cultivatrice Goma (RDC)">Cultivatrice Goma (RDC)</option>
                        <option value="Formatrice de terrain">Formatrice de terrain</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-sec block mb-1">Note de l'application</label>
                      <div className="flex gap-1.5 items-center h-10 px-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setForm({ ...form, rating: star })}
                            className="text-brand-secondary hover:scale-110 transition-transform"
                          >
                            <Star size={18} fill={star <= form.rating ? "#D98A2C" : "none"} className="text-brand-secondary" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-sec block mb-1">Observations & suggestions</label>
                    <textarea
                      required
                      rows={3}
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      placeholder="Commentaires sur l'utilisation hors ligne, le français simple ou les éléments de design..."
                      className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-eclosion shadow-sm transition-all h-10 active:scale-[0.99]"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={12} />
                        Envoyer le rapport de test
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Live feedbacks Feed */}
            <div className="bg-white border border-surface-ter rounded-eclosion p-5 flex-1 min-h-[220px] flex flex-col shadow-sm">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 mb-3">
                <Users size={16} className="text-brand-primary" />
                Retours de test enregistrés ({feedbacks.length})
              </h3>

              {feedbacks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-text-ter p-4">
                  <MessageSquare size={24} className="opacity-40 mb-2" />
                  <p className="text-[11px]">Aucun rapport de test pour l'instant.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {feedbacks.map((f) => (
                    <div key={f.feedback_id} className="bg-surface-sec p-3 rounded-eclosion border border-surface-ter text-xs">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <span className="font-bold text-text-main block">{f.name}</span>
                          <span className="text-[10px] text-text-ter">{f.role}</span>
                        </div>
                        <div className="flex gap-0.5 text-brand-secondary">
                          {Array.from({ length: f.rating }).map((_, i) => (
                            <Star key={i} size={10} fill="#D98A2C" className="text-brand-secondary border-none" />
                          ))}
                        </div>
                      </div>
                      <p className="text-text-sec leading-relaxed italic">"{f.comment}"</p>
                      <span className="text-[9px] text-text-ter block mt-1.5 text-right font-mono">
                        {new Date(f.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
