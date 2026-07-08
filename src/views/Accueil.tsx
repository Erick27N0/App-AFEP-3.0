import React from "react";
import { 
  Search, 
  Activity, 
  Heart, 
  Bell, 
  BarChart2, 
  MapPin, 
  Plus, 
  Star, 
  ChevronRight,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import { User, Opportunity, FavoriteItem } from "../types";

interface AccueilProps {
  user: User;
  opportunities: Opportunity[];
  favorites: FavoriteItem[];
  checklistDoneCount: number;
  totalChecklistCount: number;
  onNavigateToView: (view: string) => void;
  onNavigate: (tab: string) => void;
  onToggleFavorite: (item: any) => void;
}

export default function Accueil({
  user,
  opportunities,
  favorites,
  checklistDoneCount,
  totalChecklistCount,
  onNavigateToView,
  onNavigate,
  onToggleFavorite
}: AccueilProps) {
  
  const featured = opportunities.find((o) => o.featured) || opportunities[0];
  const rest = opportunities.filter((o) => o.opp_id !== featured?.opp_id);

  const isOppFavorite = (oppId: string) => {
    return favorites.some((f) => f.kind === "opportunity" && f.id === oppId);
  };

  const handleFavoriteClick = (e: React.MouseEvent, opp: Opportunity) => {
    e.stopPropagation();
    onToggleFavorite({
      id: opp.opp_id,
      kind: "opportunity",
      title: opp.title,
      subtitle: opp.location,
      description: opp.description,
      href: "/"
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-main select-none">
      
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-surface-ter select-none">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-[#7B3FF2] tracking-wider block uppercase">
              Réseau AFEP-3.0
            </span>
            <span className="text-[9px] px-1 bg-[#132B63]/10 text-[#132B63] font-bold rounded">OFFICIEL</span>
          </div>
          <h2 className="text-xl font-bold text-[#132B63] leading-tight truncate">
            {user.name.split(" ")[0] || "Bienvenue"}
          </h2>
        </div>

        {/* Quick Nav Header Icons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onNavigateToView("search")}
            title="Rechercher"
            className="p-2 text-text-sec hover:bg-surface-sec rounded-full transition-all"
          >
            <Search size={19} />
          </button>
          <button 
            onClick={() => onNavigateToView("dashboard")}
            title="Tableau de bord"
            className="p-2 text-brand-primary hover:bg-surface-sec rounded-full transition-all"
          >
            <Activity size={19} />
          </button>
          <button 
            onClick={() => onNavigateToView("favorites")}
            title="Favoris"
            className="p-2 text-brand-secondary hover:bg-surface-sec rounded-full transition-all"
          >
            <Heart size={19} />
          </button>
          <button 
            onClick={() => onNavigateToView("reminders")}
            title="Rappels"
            className="p-2 text-brand-secondary hover:bg-surface-sec rounded-full transition-all"
          >
            <Bell size={19} />
          </button>
          <button 
            onClick={() => onNavigateToView("admin")}
            title="Administration"
            className="p-2 text-brand-primary hover:bg-surface-sec rounded-full transition-all"
          >
            <BarChart2 size={19} />
          </button>
          
          <div className="w-9 h-9 rounded-full bg-brand-tertiary text-on-brand-tertiary flex items-center justify-center font-bold text-sm shrink-0 border border-[#E5E7EB] ml-1">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* Onboarding overall progress card */}
        <div className="px-6 pt-4">
          <button 
            onClick={() => onNavigateToView("dashboard")}
            className="w-full bg-surface-sec hover:bg-surface-sec/80 border border-surface-ter p-4 rounded-eclosion flex items-center gap-4 text-left transition-all active:scale-[0.99] shadow-sm"
          >
            <div className="flex-1">
              <span className="text-[10px] text-text-ter font-semibold tracking-wide block">
                Tableau de bord personnel
              </span>
              <h3 className="text-base font-bold text-text-main mt-0.5">
                {checklistDoneCount}/{totalChecklistCount} étapes d'onboarding validées
              </h3>
              <div className="w-full bg-surface-ter h-2 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className="bg-brand-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${(checklistDoneCount / totalChecklistCount) * 100}%` }}
                />
              </div>
            </div>
            <ChevronRight size={18} className="text-text-ter shrink-0" />
          </button>
        </div>

        {/* Featured Opportunity section */}
        <div className="px-6 mt-6">
          <h3 className="text-base font-semibold text-text-main mb-3 flex items-center gap-1.5">
            À la une
          </h3>

          {featured && (
            <div className="relative w-full h-[220px] rounded-eclosion overflow-hidden shadow-sm flex flex-col justify-end p-4 text-white">
              <img 
                src={featured.image_url} 
                alt={featured.title} 
                className="absolute inset-0 w-full h-full object-cover object-center z-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />

              <div className="relative z-20 flex flex-col gap-1.5 w-full">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[10px] font-semibold bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full tracking-wider block">
                    {featured.sector}
                  </span>
                  
                  <button 
                    onClick={(e) => handleFavoriteClick(e, featured)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all active:scale-90"
                  >
                    <Star 
                      size={15} 
                      fill={isOppFavorite(featured.opp_id) ? "#D98A2C" : "none"} 
                      className={isOppFavorite(featured.opp_id) ? "text-brand-secondary" : "text-white"}
                    />
                  </button>
                </div>

                <h4 className="text-base font-bold leading-tight mt-1 line-clamp-2">
                  {featured.title}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-[#CCC6C0]">
                  <MapPin size={12} className="text-white shrink-0" />
                  <span className="truncate">{featured.location}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Other Opportunities section */}
        <div className="px-6 mt-6 flex flex-col gap-3">
          <h3 className="text-base font-semibold text-text-main mb-1">
            Autres opportunités locales
          </h3>

          {rest.map((opp) => (
            <div 
              key={opp.opp_id}
              className="bg-surface-sec border border-surface-ter p-3 rounded-eclosion flex gap-3 shadow-sm hover:border-brand-primary/20 transition-all select-none"
            >
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-brand-primary">{opp.sector}</span>
                  <button 
                    onClick={(e) => handleFavoriteClick(e, opp)}
                    className="p-1 text-text-ter hover:text-brand-secondary transition-all"
                  >
                    <Star 
                      size={14} 
                      fill={isOppFavorite(opp.opp_id) ? "#D98A2C" : "none"} 
                      className={isOppFavorite(opp.opp_id) ? "text-brand-secondary" : "text-text-ter"}
                    />
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-text-main leading-snug line-clamp-1">{opp.title}</h4>
                <p className="text-xs text-text-sec mt-1 line-clamp-2 leading-relaxed flex-1">{opp.description}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-text-ter">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{opp.location}</span>
                </div>
              </div>

              <img 
                src={opp.image_url} 
                alt={opp.title} 
                className="w-20 h-20 rounded-eclosion object-cover shrink-0 border border-surface-ter"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => onNavigate("groupe")}
        className="absolute bottom-[96px] right-6 flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-semibold text-sm px-4 py-3 rounded-full shadow-lg transition-all active:scale-95 z-30 select-none cursor-pointer"
      >
        <Plus size={18} />
        <span>Créer un groupe</span>
      </button>

    </div>
  );
}
