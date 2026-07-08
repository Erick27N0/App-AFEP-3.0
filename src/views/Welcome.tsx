import React, { useState } from "react";
import { Zap, User, ArrowLeft, Send, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import welcomeBg from "../assets/images/welcome_bg_afep3_1783507778316.jpg";

interface WelcomeProps {
  onLogin: (userName: string, email: string, password: string) => Promise<boolean>;
  onLoginDemo: () => Promise<void> | void;
}

export default function Welcome({ onLogin, onLoginDemo }: WelcomeProps) {
  const [loading, setLoading] = useState<"demo" | "custom" | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration Form States
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    village: "",
    country: "Cameroun"
  });

  const handleDemo = async () => {
    setLoading("demo");
    await onLoginDemo();
    setLoading(null);
  };

  const handleCustomRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim() || regForm.password.length < 4) return;
    setLoading("custom");
    const displayName = `${regForm.name} (${regForm.village}, ${regForm.country})`;
    await onLogin(displayName, regForm.email, regForm.password);
    setLoading(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-end min-h-[760px] text-white">
      {/* Background Image showing AFEP-3.0 custom fabric */}
      <img
        src={welcomeBg}
        alt="African Rural Women in AFEP-3.0 Pagne"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        referrerPolicy="no-referrer"
      />
      {/* Dark Scrim Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />

      {/* Main Copy & Interactive Actions */}
      <div className="relative z-20 p-6 flex flex-col gap-4 pb-12 w-full">
        <AnimatePresence mode="wait">
          {!isRegistering ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-brand-secondary text-xs font-semibold tracking-wider block">
                    Éclosion
                  </span>
                  <span className="text-white/40 text-[10px]">•</span>
                  <span className="text-white/70 text-[10px] uppercase font-mono font-bold tracking-wider">
                    Par AFEP-3.0
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                  Ensemble, bâtissons l'avenir
                </h1>
                <p className="text-[#E6E1DC] text-sm leading-relaxed mt-2">
                  La plateforme d'autonomisation propulsée par l'association <strong className="text-white">AFEP-3.0</strong> pour les groupes de femmes rurales d'Afrique Centrale. Connectez-vous, formez-vous et financez vos projets.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => setIsRegistering(true)}
                  className="w-full flex items-center justify-center gap-3 bg-[#4A6B4E] hover:bg-[#4A6B4E]/95 text-white font-semibold text-sm py-3.5 px-6 rounded-eclosion shadow-md transition-all active:scale-[0.98]"
                >
                  <User size={18} />
                  Créer un compte ou me connecter
                </button>

                <button
                  onClick={handleDemo}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-center gap-3 bg-brand-secondary hover:bg-brand-secondary/95 text-white font-medium text-sm py-3 px-6 rounded-eclosion transition-all active:scale-[0.98]"
                >
                  {loading === "demo" ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap size={16} />
                      Accès rapide (compte d'évaluation)
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-[#CCC6C0]/60 text-center leading-relaxed mt-4">
                En continuant, vous acceptez de rejoindre le réseau communautaire Éclosion d'Afrique Centrale.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white text-text-main rounded-eclosion p-5 border border-surface-ter shadow-xl flex flex-col gap-4 w-full"
            >
              <div className="flex items-center gap-2 border-b border-surface-ter pb-3">
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)}
                  className="p-1 hover:bg-surface-sec rounded-full transition-all text-text-sec"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-text-main">Créer votre compte ou vous connecter</h3>
                  <p className="text-[10px] text-text-ter">Si vous avez déjà un compte, entrez le même identifiant et mot de passe</p>
                </div>
              </div>

              <form onSubmit={handleCustomRegister} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-text-sec block mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Ex: Mireille Alogo"
                    className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-sec block mb-1">Adresse email (ou identifiant de test)</label>
                  <input
                    type="text"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="Ex: mireille@gmail.com ou mireille1"
                    className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-sec block mb-1 flex items-center gap-1">
                    <KeyRound size={12} className="text-brand-primary" />
                    Mot de passe (4 caractères minimum)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Choisissez un mot de passe simple à retenir"
                    className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text-sec block mb-1">Pays</label>
                    <select
                      value={regForm.country}
                      onChange={(e) => setRegForm({ ...regForm, country: e.target.value })}
                      className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                    >
                      <option value="Cameroun">Cameroun</option>
                      <option value="Congo">Congo</option>
                      <option value="Gabon">Gabon</option>
                      <option value="RCA">RCA</option>
                      <option value="Tchad">Tchad</option>
                      <option value="RDC">RDC</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-sec block mb-1">Ville / Village</label>
                    <input
                      type="text"
                      required
                      value={regForm.village}
                      onChange={(e) => setRegForm({ ...regForm, village: e.target.value })}
                      placeholder="Ex: Bafia"
                      className="w-full px-3 py-2 bg-surface-sec border border-surface-ter text-xs text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all h-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading === "custom"}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-eclosion shadow-sm transition-all h-11 mt-2 active:scale-[0.99]"
                >
                  {loading === "custom" ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={13} />
                      Créer mon compte et me connecter
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
