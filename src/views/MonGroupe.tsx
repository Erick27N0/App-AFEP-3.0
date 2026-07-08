import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  MapPin, 
  PlusCircle, 
  LogOut, 
  Send, 
  Mail, 
  User, 
  MessageSquare,
  AlertCircle,
  Plus,
  Compass,
  ChevronRight,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { Group, GroupMessage, User as UserType } from "../types";

interface MonGroupeProps {
  user: UserType;
  group: Group | null;
  members: UserType[];
  allGroups: Group[];
  messages: GroupMessage[];
  onNavigateToView: (view: string) => void;
  onCreateGroup: (name: string, location: string, description: string) => Promise<void>;
  onJoinGroup: (groupId: string) => Promise<void>;
  onLeaveGroup: (groupId: string) => void;
  onSendMessage: (content: string) => Promise<void>;
  onLogout: () => void;
}

export default function MonGroupe({
  user,
  group,
  members,
  allGroups,
  messages,
  onNavigateToView,
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  onSendMessage,
  onLogout,
}: MonGroupeProps) {
  const [mode, setMode] = useState<"idle" | "create" | "join">("idle");
  const [form, setForm] = useState({ name: "", description: "", location: "" });
  const [messageText, setMessageText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) return;
    setBusy(true);
    try {
      await onCreateGroup(form.name, form.location, form.description);
      setForm({ name: "", description: "", location: "" });
      setMode("idle");
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    setBusy(true);
    try {
      await onJoinGroup(groupId);
      setMode("idle");
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    try {
      await onSendMessage(messageText);
      setMessageText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Has a group → Dashboard
  if (group) {
    return (
      <div className="flex flex-col h-full bg-surface-main select-none">
        
        {/* Banner header */}
        <div className="bg-brand-tertiary px-6 py-8 border-b border-surface-ter flex flex-col items-center gap-2.5 text-center relative select-none">
          <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white select-none">
            {group.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-brand-tertiary">{group.name}</h2>
            <div className="flex items-center justify-center gap-1.5 text-xs text-text-sec mt-1">
              <MapPin size={12} className="text-brand-primary" />
              <span>{group.location}</span>
            </div>
          </div>
        </div>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto pb-24">
          
          {/* About section */}
          <div className="px-6 py-5 border-b border-surface-ter bg-white select-text">
            <h3 className="text-xs font-semibold text-text-ter tracking-wider mb-2">
              À propos de notre coopérative
            </h3>
            <p className="text-xs text-text-sec leading-relaxed">
              {group.description || "Aucune description de coopérative rédigée pour l'instant."}
            </p>
          </div>

          {/* Members horizontal list */}
          <div className="px-6 py-5 border-b border-surface-ter select-none">
            <h3 className="text-xs font-semibold text-text-ter tracking-wider mb-3">
              Membres du groupe ({members.length})
            </h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-1 select-none">
              {members.map((m) => (
                <div key={m.user_id} className="flex flex-col items-center shrink-0 w-16">
                  <div className="w-10 h-10 rounded-full bg-surface-sec border border-surface-ter flex items-center justify-center font-bold text-xs text-text-main shadow-sm select-none">
                    {(m.name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[10px] text-text-sec text-center truncate w-full mt-1.5 font-medium">
                    {m.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Group Chat Message Board */}
          <div className="px-6 py-5 border-b border-surface-ter bg-white flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-text-ter tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-brand-primary" />
              Discussions de la coopérative
            </h3>

            {/* Chat Composer Form */}
            <form onSubmit={handleSend} className="flex items-end gap-2 mt-1">
              <input
                type="text"
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Écrire un message au groupe..."
                className="flex-1 px-4 py-2.5 bg-surface-sec border border-surface-ter text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all text-xs shadow-sm"
              />
              <button
                type="submit"
                disabled={sendingMsg || !messageText.trim()}
                className="w-10 h-10 rounded-full bg-brand-primary hover:bg-brand-primary/95 text-white flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90"
              >
                <Send size={15} />
              </button>
            </form>

            {/* Messages Feed */}
            {messages.length === 0 ? (
              <p className="text-xs text-text-ter text-center py-4 italic select-none">
                Aucun message échangé pour l'instant. Lancez la discussion !
              </p>
            ) : (
              <div className="space-y-3 mt-2 max-h-[220px] overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const isMine = msg.user_id === user.user_id;
                  return (
                    <div 
                      key={msg.message_id}
                      className={`flex flex-col gap-1 max-w-[85%] rounded-eclosion p-2.5 shadow-sm text-xs ${
                        isMine 
                          ? "bg-brand-tertiary border border-brand-primary/10 self-end ml-auto" 
                          : "bg-surface-sec border border-surface-ter self-start mr-auto"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-bold text-text-main truncate">
                          {isMine ? "Vous" : msg.user_name}
                        </span>
                        <span className="text-[9px] text-text-ter">
                          {new Date(msg.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short"
                          })}
                        </span>
                      </div>
                      <p className="text-text-sec leading-relaxed select-text">{msg.content}</p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Account and Quit Section */}
          <div className="px-6 py-5 flex flex-col gap-4 select-none">
            <h3 className="text-xs font-semibold text-text-ter tracking-wider">
              Mon profil Éclosion
            </h3>
            
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-xs text-text-sec bg-surface-sec border border-surface-ter p-3 rounded-eclosion">
                <Mail size={14} className="text-brand-primary" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2.5 text-xs text-text-sec bg-surface-sec border border-surface-ter p-3 rounded-eclosion">
                <User size={14} className="text-brand-primary" />
                <span>Identifiant : {user.user_id}</span>
              </div>
            </div>

            <button
              onClick={() => onLeaveGroup(group.group_id)}
              className="inline-flex items-center justify-center gap-2 py-2 px-4 border border-error-main/20 hover:bg-red-50 text-error-main text-xs font-semibold rounded-eclosion mt-2 transition-all active:scale-[0.98]"
            >
              Quitter la coopérative
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-surface-sec hover:bg-surface-ter border border-surface-ter text-text-main text-xs font-bold rounded-eclosion transition-all active:scale-[0.98] mt-2 shadow-sm"
            >
              <LogOut size={14} className="text-error-main" />
              Se déconnecter de la plateforme
            </button>
          </div>

        </div>

      </div>
    );
  }

  // No group → Create or Join Selection card
  return (
    <div className="flex flex-col h-full bg-surface-main select-none">
      
      {/* Welcome no-group header */}
      <div className="px-6 py-5 bg-white border-b border-surface-ter select-none">
        <h2 className="text-xl font-bold text-text-main leading-tight">Mon Groupe</h2>
        <p className="text-xs text-text-ter leading-snug mt-0.5">
          Rejoignez un groupe existant ou créez le vôtre pour collaborer.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 select-none">
        
        {mode === "idle" && (
          <div className="flex flex-col gap-4 mt-2 select-none">
            {/* Create Trigger */}
            <button
              onClick={() => setMode("create")}
              className="w-full bg-brand-primary hover:bg-brand-primary/95 text-white p-5 rounded-eclosion flex items-center gap-4 text-left transition-all active:scale-[0.98] shadow-md select-none"
            >
              <PlusCircle size={28} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold leading-snug">Créer un groupe</h3>
                <p className="text-xs opacity-90 leading-tight mt-0.5">Démarrez votre propre coopérative locale rutilante.</p>
              </div>
            </button>

            {/* Join Trigger */}
            <button
              onClick={() => setMode("join")}
              className="w-full bg-surface-sec hover:bg-surface-ter border border-surface-ter text-text-main p-5 rounded-eclosion flex items-center gap-4 text-left transition-all active:scale-[0.98] shadow-sm select-none"
            >
              <Users size={24} className="text-brand-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold leading-snug">Rejoindre un groupe</h3>
                <p className="text-xs text-text-ter leading-tight mt-0.5">
                  {allGroups.length} groupe(s) disponible(s) dans l'annuaire.
                </p>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-surface-sec hover:bg-surface-ter border border-surface-ter text-text-main text-xs font-bold rounded-eclosion transition-all active:scale-[0.98] mt-8 shadow-sm select-none"
            >
              <LogOut size={14} className="text-error-main" />
              Se déconnecter
            </button>
          </div>
        )}

        {/* Create form */}
        {mode === "create" && (
          <form onSubmit={handleCreate} className="space-y-4 select-none">
            <div className="flex justify-between items-center mb-1 select-none">
              <span className="text-xs font-semibold text-text-ter tracking-wider">Nouveau groupe</span>
              <button 
                type="button" 
                onClick={() => setMode("idle")}
                className="text-xs text-brand-primary font-bold"
              >
                Annuler
              </button>
            </div>

            <div className="space-y-3 select-none">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">Nom de la coopérative</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Coopérative des Femmes de Bafia"
                  className="w-full px-4 py-2.5 bg-surface-sec border border-surface-ter text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all text-xs shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">Localisation</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Ex: Bafia, Cameroun"
                  className="w-full px-4 py-2.5 bg-surface-sec border border-surface-ter text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all text-xs shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-text-main">Description du projet commun</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Nous transformons le manioc pour produire de la farine..."
                  className="w-full px-4 py-2.5 bg-surface-sec border border-surface-ter text-text-main rounded-eclosion focus:outline-none focus:border-brand-primary transition-all text-xs shadow-sm resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-eclosion shadow-md transition-all active:scale-[0.98]"
            >
              {busy ? "Création en cours..." : "Créer le groupe de travail"}
            </button>
          </form>
        )}

        {/* Join form */}
        {mode === "join" && (
          <div className="space-y-4 select-none">
            <div className="flex justify-between items-center mb-1 select-none">
              <span className="text-xs font-bold text-text-ter uppercase tracking-wider">Groupes disponibles</span>
              <button 
                onClick={() => setMode("idle")}
                className="text-xs text-brand-primary font-bold"
              >
                Retour
              </button>
            </div>

            {allGroups.length === 0 ? (
              <p className="text-xs text-text-ter text-center py-6">Aucun groupe créé pour l'instant.</p>
            ) : (
              <div className="space-y-2.5">
                {allGroups.map((g) => (
                  <div
                    key={g.group_id}
                    onClick={() => handleJoin(g.group_id)}
                    className="bg-surface-sec border border-surface-ter p-3.5 rounded-eclosion flex items-center gap-3.5 shadow-sm hover:border-brand-primary/20 transition-all active:scale-[0.99] cursor-pointer text-left select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-tertiary flex items-center justify-center shrink-0 border border-[#E6E1DC]">
                      <Users size={18} className="text-brand-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-text-main truncate">{g.name}</h4>
                      <p className="text-[10px] text-text-ter mt-0.5 truncate leading-tight">
                        {g.location} • {g.members?.length || 1} membre(s)
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-text-ter shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
