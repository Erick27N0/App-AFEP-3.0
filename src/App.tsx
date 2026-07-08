import React, { useState, useEffect } from "react";
import { 
  Home, 
  BookOpen, 
  FileText, 
  Users, 
  Heart, 
  Bell, 
  Search, 
  Activity, 
  Smartphone, 
  CheckCircle, 
  ShieldAlert, 
  Star,
  RefreshCw,
  FolderOpen,
  ClipboardCheck,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import Shared Modular Types and Data
import { User, Group, GroupMessage, FundingRequest, LocalReminder, FavoriteItem } from "./types";
import { SEED_OPPORTUNITIES, SEED_DONORS, TRAINING_MODULES } from "./data";
import { apiFetch, getToken, setToken, getCachedUser, setCachedUser } from "./api";

// Import Shared Views
import Welcome from "./views/Welcome";
import Dashboard from "./views/Dashboard";
import Accueil from "./views/Accueil";
import Formations from "./views/Formations";
import Financement from "./views/Financement";
import MonGroupe from "./views/MonGroupe";
import Bailleurs from "./views/Bailleurs";
import SearchScreen from "./views/Search";
import Reminders from "./views/Reminders";
import BetaPortal from "./components/BetaPortal";

// Import Shared Components
// No simulator components needed for direct production webapp

export default function App() {
  // Core user session states
  const [user, setUser] = useState<User | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [pitches, setPitches] = useState<FundingRequest[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [reminders, setReminders] = useState<LocalReminder[]>([]);
  const [donors, setDonors] = useState<any[]>([]);

  // Navigation controller
  const [activeTab, setActiveTab] = useState<"accueil" | "formations" | "financement" | "groupe">("accueil");
  const [activeView, setActiveView] = useState<string | null>(null); // "dashboard" | "donors" | "search" | "reminders" | "admin"

  // Offline course cache states
  const [downloadedIds, setDownloadedIds] = useState<string[]>(["mod_001"]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // Global toast alerts
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, kind: "success" | "error" | "info" = "success") => {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync state from server on mount & periodically
  const fetchAllData = async () => {
    try {
      // 1. Fetch Donors with Ratings
      const donRes = await fetch("/api/donors");
      if (donRes.ok) {
        const dData = await donRes.json();
        setDonors(dData);
      }

      // 2. Fetch All Groups
      const grpRes = await fetch("/api/groups");
      if (grpRes.ok) {
        const gData = await grpRes.json();
        setAllGroups(gData);
      }

      // If user session is active, fetch user-specific records (identified by session token)
      if (user && getToken()) {
        // 3. Fetch User's Group
        const mineRes = await apiFetch("/api/groups/mine");
        if (mineRes.ok) {
          const mData = await mineRes.json();
          setGroup(mData.group);
          setMembers(mData.members_info);

          if (mData.group) {
            // 4. Fetch Group Chat Messages
            const msgRes = await apiFetch("/api/groups/mine/messages");
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              setMessages(msgData);
            }
          }
        }

        // 5. Fetch User's Pitches
        const pitRes = await apiFetch("/api/funding/mine");
        if (pitRes.ok) {
          const pitData = await pitRes.json();
          setPitches(pitData);
        }
      }
    } catch (err) {
      console.error("Connection to background Express server failed, using local mockup backups:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000); // Poll chat/group data every 8s
    return () => clearInterval(interval);
  }, [user]);

  // Restore server session on startup (keeps user logged in after refresh)
  useEffect(() => {
    const restoreSession = async () => {
      if (!getToken()) return;
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const restoredUser = await res.json();
          setUser(restoredUser);
          setCachedUser(restoredUser);
        } else if (res.status === 401) {
          // Session invalide ou expirée : nettoyage
          setToken(null);
          setCachedUser(null);
        }
      } catch (err) {
        // Serveur injoignable : on garde la session locale pour le mode hors-ligne
        const cached = getCachedUser<User>();
        if (cached) {
          setUser(cached);
          showToast("Mode hors-ligne : serveur injoignable, données locales chargées.", "info");
        }
      }
    };
    restoreSession();
  }, []);

  // Read client-side saved courses on startup
  useEffect(() => {
    const cachedDls = localStorage.getItem("eclosion_downloaded_ids");
    if (cachedDls) setDownloadedIds(JSON.parse(cachedDls));
    const cachedComps = localStorage.getItem("eclosion_completed_ids");
    if (cachedComps) setCompletedIds(JSON.parse(cachedComps));
    const cachedFavs = localStorage.getItem("eclosion_favorites_list");
    if (cachedFavs) setFavorites(JSON.parse(cachedFavs));
    const cachedRems = localStorage.getItem("eclosion_reminders_list");
    if (cachedRems) setReminders(JSON.parse(cachedRems));
  }, []);

  // Save courses state changes
  const saveDownloaded = (next: string[]) => {
    setDownloadedIds(next);
    localStorage.setItem("eclosion_downloaded_ids", JSON.stringify(next));
  };

  const saveCompleted = (next: string[]) => {
    setCompletedIds(next);
    localStorage.setItem("eclosion_completed_ids", JSON.stringify(next));
  };

  // Account creation / login with password (server verifies credentials)
  const handleLogin = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiFetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        setToken(body.session_token);
        setCachedUser(body.user);
        setUser(body.user);
        showToast(`Bienvenue sur Éclosion, ${body.user.name} !`, "success");
        return true;
      }
      showToast(body.error || "Connexion refusée. Vérifiez vos identifiants.", "error");
      return false;
    } catch (err) {
      showToast("Serveur injoignable. Vérifiez votre connexion internet puis réessayez.", "error");
      return false;
    }
  };

  const handleLoginDemo = async () => {
    try {
      const res = await apiFetch("/api/auth/demo-login", { method: "POST" });
      if (res.ok) {
        const body = await res.json();
        setToken(body.session_token);
        setCachedUser(body.user);
        setUser(body.user);
        showToast("Session d'évaluation chargée !", "success");
      } else {
        showToast("Le compte d'évaluation est indisponible.", "error");
      }
    } catch (err) {
      showToast("Serveur injoignable. Vérifiez votre connexion internet puis réessayez.", "error");
    }
  };

  const handleLogout = () => {
    // Invalide la session côté serveur (sans bloquer la déconnexion locale)
    apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setToken(null);
    setCachedUser(null);
    setUser(null);
    setGroup(null);
    setMembers([]);
    setMessages([]);
    setActiveTab("accueil");
    setActiveView(null);
    showToast("Vous avez été déconnectée.", "info");
  };

  // Favorites toggle
  const handleToggleFavorite = (item: any) => {
    const exists = favorites.find((f) => f.kind === item.kind && f.id === item.id);
    let next: FavoriteItem[] = [];
    if (exists) {
      next = favorites.filter((f) => !(f.kind === item.kind && f.id === item.id));
      showToast("Favori retiré.", "info");
    } else {
      next = [...favorites, { ...item, saved_at: Date.now() }];
      showToast("Favori ajouté avec succès !", "success");
    }
    setFavorites(next);
    localStorage.setItem("eclosion_favorites_list", JSON.stringify(next));
  };

  // Course Download trigger
  const handleToggleDownload = (modId: string) => {
    const exists = downloadedIds.includes(modId);
    let next: string[] = [];
    if (exists) {
      next = downloadedIds.filter((id) => id !== modId);
      showToast("Module retiré du stockage hors ligne.", "info");
    } else {
      next = [...downloadedIds, modId];
      showToast("Module enregistré pour consultation hors ligne !", "success");
    }
    saveDownloaded(next);
  };

  // Course Complete trigger
  const handleToggleComplete = (modId: string) => {
    const exists = completedIds.includes(modId);
    let next: string[] = [];
    if (exists) {
      next = completedIds.filter((id) => id !== modId);
      showToast("Module remis dans les cours à faire.", "info");
    } else {
      next = [...completedIds, modId];
      showToast("Module validé ! Félicitations !", "success");
    }
    saveCompleted(next);
  };

  const handleDownloadAll = () => {
    const allIds = TRAINING_MODULES.map((m) => m.module_id);
    saveDownloaded(allIds);
    showToast("Tous les cours ont été sauvegardés hors ligne !", "success");
  };

  // Reminders scheduler
  const handleAddReminder = (kind: "training" | "funding" | "opportunities", title: string, message: string, delayHours: number) => {
    const now = Date.now();
    const newRem: LocalReminder = {
      reminder_id: "rem_" + Math.random().toString(36).substring(2, 10),
      kind,
      title,
      message,
      due_at: now + delayHours * 60 * 60 * 1000,
      created_at: now,
      done_at: null,
      notified_at: null
    };
    const next = [...reminders, newRem];
    setReminders(next);
    localStorage.setItem("eclosion_reminders_list", JSON.stringify(next));
    showToast(`Rappel planifié : ${title}`, "success");
  };

  const handleMarkReminderDone = (id: string) => {
    const next = reminders.map((r) => r.reminder_id === id ? { ...r, done_at: Date.now() } : r);
    setReminders(next);
    localStorage.setItem("eclosion_reminders_list", JSON.stringify(next));
    showToast("Rappel marqué comme terminé !", "success");
  };

  const handleDeleteReminder = (id: string) => {
    const next = reminders.filter((r) => r.reminder_id !== id);
    setReminders(next);
    localStorage.setItem("eclosion_reminders_list", JSON.stringify(next));
    showToast("Rappel supprimé.", "info");
  };

  // Cooperative create / join actions
  const handleCreateGroup = async (name: string, location: string, description: string) => {
    try {
      const res = await apiFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name, description, location })
      });
      if (res.ok) {
        showToast("Coopérative créée avec succès !", "success");
        fetchAllData();
      } else {
        const body = await res.json().catch(() => ({}));
        showToast(body.error || "La création du groupe a échoué.", "error");
      }
    } catch (err) {
      showToast("La création du groupe a échoué. Mode déconnecté.", "error");
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const res = await apiFetch(`/api/groups/${groupId}/join`, {
        method: "POST"
      });
      if (res.ok) {
        showToast("Vous avez rejoint la coopérative !", "success");
        fetchAllData();
      }
    } catch (err) {
      showToast("Impossible de rejoindre. Mode déconnecté.", "error");
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const res = await apiFetch(`/api/groups/${groupId}/leave`, {
        method: "POST"
      });
      if (res.ok) {
        setGroup(null);
        setMembers([]);
        setMessages([]);
        showToast("Vous avez quitté la coopérative.", "info");
        fetchAllData();
      }
    } catch (err) {
      showToast("Déconnexion de groupe échouée.", "error");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!group) return;
    try {
      const res = await apiFetch(`/api/groups/mine/messages`, {
        method: "POST",
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      showToast("Le message n'a pas pu être envoyé.", "error");
    }
  };

  // AI pitch submission
  const handleGeneratePitch = async (inputs: any) => {
    try {
      const res = await apiFetch("/api/funding/generate", {
        method: "POST",
        body: JSON.stringify(inputs)
      });
      if (res.ok) {
        showToast("Plan d'affaires généré par l'IA !", "success");
        fetchAllData();
      } else {
        throw new Error();
      }
    } catch (err) {
      showToast("L'IA n'est pas joignable. Utilisation du plan type.", "info");
      // Fallback draft request
      const fallbackRequest: FundingRequest = {
        request_id: "fund_fallback_" + Math.random().toString(36).substring(2, 10),
        user_id: user?.user_id || "user_demo_1",
        project_name: inputs.project_name,
        sector: inputs.sector,
        problem: inputs.problem,
        solution: inputs.solution,
        target_amount: inputs.target_amount,
        beneficiaries: inputs.beneficiaries,
        pitch: `## Résumé exécutif\nLe groupe maraîcher présente fièrement le projet **${inputs.project_name}** dans le secteur **${inputs.sector}**. Afin d'aider notre communauté à s'autonomiser, nous sollicitons respectueusement un financement d'un montant de **${inputs.target_amount}**.\n\n## Le problème\nActuellement, nos membres font face à un obstacle majeur : **${inputs.problem}**. Sans solution adaptée, ces difficultés limitent nos revenus et entraînent des pertes matérielles ou agricoles significatives pour de nombreuses familles du village.\n\n## Notre solution\nPour y remédier, notre coopérative va mettre en œuvre la solution suivante : **${inputs.solution}**. Ce projet nous permettra d'accroître de manière drastique notre capacité de production et de vente locale.\n\n## Plan d'utilisation des fonds\n* Équipements de production principaux (60%)\n* Fonds de roulement et conditionnement (25%)\n* Formation des membres (15%)\n\n## Pourquoi nous soutenir\nUn groupe de femmes actives et soudées ayant d'excellentes compétences pratiques.`,
        ai_generated: false,
        status: "Soumis",
        created_at: new Date().toISOString()
      };
      setPitches([fallbackRequest, ...pitches]);
    }
  };

  // Donor ratings submission (le serveur signe l'avis avec le nom du compte connecté)
  const handleRateDonor = async (donorId: string, stars: number, outcome: string, comment: string) => {
    try {
      const res = await apiFetch(`/api/donors/${donorId}/rate`, {
        method: "POST",
        body: JSON.stringify({ stars, outcome, comment })
      });
      if (res.ok) {
        showToast("Votre avis a été enregistré !", "success");
        fetchAllData();
      }
    } catch (err) {
      showToast("La publication a échoué.", "error");
    }
  };

  // Helper calculating checklist done items
  const getChecklistDoneCount = () => {
    let count = 0;
    if (group) count++;
    if (completedIds.length > 0) count++;
    if (favorites.length > 0) count++;
    if (reminders.length > 0) count++;
    if (pitches.length > 0) count++;
    return count;
  };

  return (
    <div className="w-full min-h-screen bg-surface-sec flex items-start justify-center font-sans select-none overflow-x-hidden">
      
      {/* Central Clean Container: Full screen on mobile, elegant mobile-width on desktop */}
      <div className="w-full max-w-md min-h-screen bg-[#FDFDFB] shadow-sm md:border-x border-surface-ter flex flex-col relative overflow-hidden">
        
        {/* Dynamic Views Stack */}
        <div className="flex-1 w-full overflow-hidden relative flex flex-col">
          
          {/* 1. Welcome state */}
          {!user && (
            <Welcome 
              onLogin={handleLogin} 
              onLoginDemo={handleLoginDemo} 
            />
          )}

          {/* Logged In states */}
          {user && (
            <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden">
              
              {/* Active Screen overlay views (dashboard, search, donors, reminders) */}
              <AnimatePresence mode="wait">
                {activeView === "dashboard" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-30"
                  >
                    <Dashboard
                      user={user}
                      group={group}
                      completedCount={completedIds.length}
                      totalModules={TRAINING_MODULES.length}
                      downloadedCount={downloadedIds.length}
                      favorites={favorites}
                      reminders={reminders}
                      pitches={pitches}
                      onBack={() => setActiveView(null)}
                      onNavigate={(tab) => {
                        setActiveTab(tab as any);
                        setActiveView(null);
                      }}
                      onNavigateToView={(view) => setActiveView(view)}
                    />
                  </motion.div>
                )}

                {activeView === "donors" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-30"
                  >
                    <Bailleurs
                      donors={donors}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      onBack={() => setActiveView(null)}
                      onRateDonor={handleRateDonor}
                    />
                  </motion.div>
                )}

                {activeView === "search" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-30"
                  >
                    <SearchScreen
                      opportunities={SEED_OPPORTUNITIES}
                      modules={TRAINING_MODULES}
                      donors={donors}
                      groups={allGroups}
                      onBack={() => setActiveView(null)}
                      onNavigate={(tab) => {
                        setActiveTab(tab as any);
                        setActiveView(null);
                      }}
                      onNavigateToView={(view) => setActiveView(view)}
                    />
                  </motion.div>
                )}

                {activeView === "reminders" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-30"
                  >
                    <Reminders
                      reminders={reminders}
                      onBack={() => setActiveView(null)}
                      onAddReminder={handleAddReminder}
                      onMarkDone={handleMarkReminderDone}
                      onDeleteReminder={handleDeleteReminder}
                    />
                  </motion.div>
                )}

                {activeView === "favorites" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-30 bg-surface-main flex flex-col"
                  >
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-ter bg-white select-none shrink-0">
                      <button onClick={() => setActiveView(null)} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
                        <ArrowLeft size={20} className="text-text-main" />
                      </button>
                      <div>
                        <h2 className="text-lg font-semibold text-text-main">Favoris</h2>
                        <p className="text-xs text-text-ter">{favorites.length} favoris enregistrés</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3.5">
                      {favorites.length === 0 ? (
                        <div className="text-center text-text-ter p-8 border-2 border-dashed border-surface-ter rounded-eclosion">
                          <Heart size={24} className="opacity-30 mx-auto mb-2" />
                          <p className="text-xs">Aucun favori enregistré pour le moment.</p>
                        </div>
                      ) : (
                        favorites.map((fav) => (
                          <div 
                            key={`${fav.kind}-${fav.id}`}
                            onClick={() => {
                              if (fav.kind === "module") {
                                setActiveTab("formations");
                                setActiveView(null);
                              } else if (fav.kind === "donor") {
                                setActiveView("donors");
                              } else {
                                setActiveTab("accueil");
                                setActiveView(null);
                              }
                            }}
                            className="bg-surface-sec border border-surface-ter p-3.5 rounded-eclosion flex items-center gap-3.5 shadow-sm hover:border-brand-primary/20 transition-all active:scale-[0.99] cursor-pointer text-left"
                          >
                            <div className="w-10 h-10 rounded-full bg-brand-tertiary flex items-center justify-center shrink-0">
                              <Star size={16} fill="#D98A2C" className="text-brand-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-bold text-brand-primary uppercase tracking-wider block">{fav.kind}</span>
                              <h4 className="text-xs font-bold text-text-main truncate mt-0.5">{fav.title}</h4>
                              {fav.subtitle && <p className="text-[10px] text-text-ter mt-0.5">{fav.subtitle}</p>}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(fav);
                              }}
                              className="p-1 hover:text-brand-secondary text-brand-secondary shrink-0"
                            >
                              <Trash2 size={14} className="text-error-main" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeView === "admin" && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute inset-0 z-30"
                  >
                    <BetaPortal onBack={() => setActiveView(null)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Standard Tab Screens */}
              <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                  {activeTab === "accueil" && (
                    <Accueil
                      user={user}
                      opportunities={SEED_OPPORTUNITIES}
                      favorites={favorites}
                      checklistDoneCount={getChecklistDoneCount()}
                      totalChecklistCount={5}
                      onNavigateToView={(view) => setActiveView(view)}
                      onNavigate={(tab) => setActiveTab(tab as any)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  )}

                  {activeTab === "formations" && (
                    <Formations
                      user={user || undefined}
                      modules={TRAINING_MODULES}
                      downloadedIds={downloadedIds}
                      completedIds={completedIds}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleDownload={handleToggleDownload}
                      onToggleComplete={handleToggleComplete}
                      onDownloadAll={handleDownloadAll}
                    />
                  )}

                  {activeTab === "financement" && (
                    <Financement
                      pitches={pitches}
                      onGeneratePitch={handleGeneratePitch}
                      onNavigateToView={(view) => setActiveView(view)}
                      onNavigate={(tab) => setActiveTab(tab as any)}
                    />
                  )}

                  {activeTab === "groupe" && (
                    <MonGroupe
                      user={user}
                      group={group}
                      members={members}
                      allGroups={allGroups}
                      messages={messages}
                      onNavigateToView={(view) => setActiveView(view)}
                      onCreateGroup={handleCreateGroup}
                      onJoinGroup={handleJoinGroup}
                      onLeaveGroup={handleLeaveGroup}
                      onSendMessage={handleSendMessage}
                      onLogout={handleLogout}
                    />
                  )}
                </div>

                {/* Bottom Tab Navigation Bar */}
                <nav className="h-[76px] bg-white border-t border-surface-ter flex justify-around items-center pt-2 pb-4 px-3 select-none shrink-0">
                  <button
                    onClick={() => { setActiveTab("accueil"); setActiveView(null); }}
                    className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      activeTab === "accueil" && !activeView ? "text-brand-primary" : "text-text-ter hover:text-text-sec"
                    }`}
                  >
                    <Home size={20} />
                    <span className="text-[10px] font-bold">Accueil</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("formations"); setActiveView(null); }}
                    className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      activeTab === "formations" && !activeView ? "text-brand-primary" : "text-text-ter hover:text-text-sec"
                    }`}
                  >
                    <BookOpen size={20} />
                    <span className="text-[10px] font-bold">Formations</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("financement"); setActiveView(null); }}
                    className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      activeTab === "financement" && !activeView ? "text-brand-primary" : "text-text-ter hover:text-text-sec"
                    }`}
                  >
                    <FileText size={20} />
                    <span className="text-[10px] font-bold">Financement</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab("groupe"); setActiveView(null); }}
                    className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${
                      activeTab === "groupe" && !activeView ? "text-brand-primary" : "text-text-ter hover:text-text-sec"
                    }`}
                  >
                    <Users size={20} />
                    <span className="text-[10px] font-bold">Mon Groupe</span>
                  </button>
                </nav>
              </div>

            </div>
          )}

        </div>

        {/* Toast Messages Notification Banner */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-14 left-4 right-4 z-50 p-3.5 rounded-eclosion flex items-start gap-2.5 shadow-md border"
              style={{
                backgroundColor: 
                  toast.kind === "success" ? "#E8F0E8" : 
                  toast.kind === "info" ? "#EAF0F4" : "#FDF0F0",
                borderColor: 
                  toast.kind === "success" ? "#4A6B4E/20" : 
                  toast.kind === "info" ? "#4A5D6B/20" : "#B34D40/20",
                color: 
                  toast.kind === "success" ? "#2E4231" : 
                  toast.kind === "info" ? "#1F2E3D" : "#601F18",
              }}
            >
              <div className="font-semibold text-xs leading-normal flex-1">
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Global CSS style tweaks */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
