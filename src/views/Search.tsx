import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Search as SearchIcon, 
  Compass, 
  BookOpen, 
  Users, 
  FileText, 
  ChevronRight,
  X 
} from "lucide-react";
import { Opportunity, TrainingModule, Donor, Group } from "../types";

interface SearchProps {
  opportunities: Opportunity[];
  modules: TrainingModule[];
  donors: Donor[];
  groups: Group[];
  onBack: () => void;
  onNavigate: (tab: string) => void;
  onNavigateToView: (view: string) => void;
}

type SearchKind = "all" | "opportunity" | "module" | "donor" | "group";

interface SearchItem {
  id: string;
  kind: Exclude<SearchKind, "all">;
  title: string;
  subtitle: string;
  description: string;
  tab?: string;
  view?: string;
}

const KIND_LABELS: Record<SearchKind, string> = {
  all: "Tout",
  opportunity: "Opportunités",
  module: "Formations",
  donor: "Bailleurs",
  group: "Groupes",
};

const KIND_ICONS: Record<Exclude<SearchKind, "all">, React.ReactNode> = {
  opportunity: <Compass size={16} className="text-brand-primary" />,
  module: <BookOpen size={16} className="text-brand-primary" />,
  donor: <FileText size={16} className="text-brand-primary" />,
  group: <Users size={16} className="text-brand-primary" />,
};

export default function Search({
  opportunities,
  modules,
  donors,
  groups,
  onBack,
  onNavigate,
  onNavigateToView,
}: SearchProps) {
  
  const [query, setQuery] = useState("");
  const [activeKind, setActiveKind] = useState<SearchKind>("all");

  const searchIndex: SearchItem[] = useMemo(() => {
    const list: SearchItem[] = [];

    // Mapped opportunities
    opportunities.forEach(opp => {
      list.push({
        id: opp.opp_id,
        kind: "opportunity",
        title: opp.title,
        subtitle: `${opp.sector} • ${opp.location}`,
        description: opp.description,
        tab: "accueil"
      });
    });

    // Mapped modules
    modules.forEach(mod => {
      list.push({
        id: mod.module_id,
        kind: "module",
        title: mod.title,
        subtitle: `Formation • ${mod.duration}`,
        description: mod.summary,
        tab: "formations"
      });
    });

    // Mapped donors
    donors.forEach(don => {
      list.push({
        id: don.donor_id,
        kind: "donor",
        title: don.name,
        subtitle: `${don.type} • ${don.city}, ${don.country}`,
        description: don.description,
        view: "donors"
      });
    });

    // Mapped groups
    groups.forEach(g => {
      list.push({
        id: g.group_id,
        kind: "group",
        title: g.name,
        subtitle: `${g.location} • ${g.members?.length || 1} membre(s)`,
        description: g.description,
        tab: "groupe"
      });
    });

    return list;
  }, [opportunities, modules, donors, groups]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return searchIndex.filter(item => {
      if (activeKind !== "all" && item.kind !== activeKind) return false;
      if (!normalizedQuery) return true;
      
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchIndex, query, activeKind]);

  const handleItemClick = (item: SearchItem) => {
    if (item.tab) onNavigate(item.tab);
    else if (item.view) onNavigateToView(item.view);
  };

  return (
    <div className="flex flex-col h-full bg-surface-main select-none">
      
      {/* Search Header and Input */}
      <div className="bg-white border-b border-surface-ter px-6 py-4 flex flex-col gap-3 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all">
            <ArrowLeft size={20} className="text-text-main" />
          </button>
          <h2 className="text-lg font-semibold text-text-main">Recherche</h2>
        </div>

        <div className="relative flex items-center w-full bg-surface-sec border border-surface-ter rounded-eclosion p-2.5">
          <SearchIcon size={16} className="text-text-ter ml-1 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une formation, un bailleur..."
            className="flex-1 bg-transparent text-xs text-text-main focus:outline-none ml-2"
          />
          {query.length > 0 && (
            <button 
              onClick={() => setQuery("")}
              className="p-1 hover:bg-surface-ter rounded-full transition-all text-text-ter"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Category selector */}
      <div className="border-b border-surface-ter bg-white py-3 px-6 flex items-center gap-2 overflow-x-auto select-none shrink-0 no-scrollbar">
        {(Object.keys(KIND_LABELS) as SearchKind[]).map((kind) => {
          const active = kind === activeKind;
          return (
            <button
              key={kind}
              onClick={() => setActiveKind(kind)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all active:scale-95 ${
                active 
                  ? "bg-brand-primary text-white" 
                  : "bg-surface-sec text-text-sec border border-surface-ter hover:bg-surface-ter/50"
              }`}
            >
              {KIND_LABELS[kind]}
            </button>
          );
        })}
      </div>

      {/* Results area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="text-center text-text-ter p-8 border-2 border-dashed border-surface-ter rounded-eclosion">
            <SearchIcon size={24} className="opacity-30 mx-auto mb-2" />
            <p className="text-xs">Aucun résultat trouvé.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.kind}-${item.id}`}
              onClick={() => handleItemClick(item)}
              className="bg-surface-sec border border-surface-ter p-3.5 rounded-eclosion flex items-center gap-3.5 shadow-sm hover:border-brand-primary/20 transition-all active:scale-[0.99] cursor-pointer text-left select-none"
            >
              <div className="w-10 h-10 rounded-full bg-brand-tertiary flex items-center justify-center shrink-0 border border-surface-ter">
                {KIND_ICONS[item.kind]}
              </div>
              
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-semibold text-brand-primary tracking-wider block">
                  {KIND_LABELS[item.kind]}
                </span>
                <h4 className="text-xs font-bold text-text-main truncate leading-snug mt-0.5">{item.title}</h4>
                <p className="text-[10px] text-text-ter truncate mt-0.5">{item.subtitle}</p>
                <p className="text-[10px] text-text-sec line-clamp-1 leading-normal mt-1">{item.description}</p>
              </div>

              <ChevronRight size={14} className="text-text-ter shrink-0" />
            </div>
          ))
        )}
      </div>

    </div>
  );
}
