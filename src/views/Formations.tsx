import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Download, 
  Trash2, 
  Star, 
  ChevronRight, 
  ArrowLeft, 
  DownloadCloud, 
  Compass, 
  FileText, 
  Wallet, 
  Megaphone, 
  Users, 
  Coins,
  Volume2,
  VolumeX,
  Award,
  Share2,
  ArrowRight,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TrainingModule, FavoriteItem, User } from "../types";

interface FormationsProps {
  user?: User;
  modules: TrainingModule[];
  downloadedIds: string[];
  completedIds: string[];
  favorites: FavoriteItem[];
  onToggleFavorite: (item: any) => void;
  onToggleDownload: (modId: string) => void;
  onToggleComplete: (modId: string) => void;
  onDownloadAll: () => void;
}

// 1. Quizzes mapping for each course module
const MODULE_QUIZZES: Record<string, {
  question: string;
  options: string[];
  correctIndex: number;
}[]> = {
  mod_001: [
    {
      question: "Quelle est la première étape pour trouver une bonne opportunité d'affaires ?",
      options: [
        "Demander un prêt bancaire de 10 millions tout de suite",
        "Observer attentivement sa communauté pour repérer les produits absents ou trop chers",
        "Acheter des machines chères sans étude de marché"
      ],
      correctIndex: 1
    },
    {
      question: "Comment évaluer si vos clientes du village seront intéressées par votre produit ?",
      options: [
        "En discutant avec elles et en écoutant leurs besoins réels",
        "En devinant toute seule dans son coin",
        "En publiant une affiche en langue étrangère"
      ],
      correctIndex: 0
    },
    {
      question: "Quel facteur clé garantit la faisabilité de votre projet de transformation locale ?",
      options: [
        "La présence de beaucoup de concurrentes identiques",
        "La disponibilité des matières premières locales et de clientes prêtes à payer",
        "Avoir un grand bureau moderne"
      ],
      correctIndex: 1
    }
  ],
  mod_002: [
    {
      question: "Quelle marge bénéficiaire est généralement conseillée pour fixer son prix de vente ?",
      options: [
        "1% à 5% du coût",
        "30% à 50% au-dessus du coût de production",
        "Plus de 500%"
      ],
      correctIndex: 1
    },
    {
      question: "Que doit contenir un plan de vente simple ?",
      options: [
        "Où vendre, comment vendre et la quantité visée par semaine",
        "La liste de tous les habitants du pays",
        "L'histoire de la création du village"
      ],
      correctIndex: 0
    }
  ],
  mod_003: [
    {
      question: "Quelle est la règle d'or de la gestion financière d'une commerçante ?",
      options: [
        "Mélanger l'argent de la boutique et celui des dépenses familiales",
        "Tenir un cahier de comptes journalier et séparer strictement la caisse du foyer",
        "Ne jamais compter son argent"
      ],
      correctIndex: 1
    },
    {
      question: "À quoi sert le fonds de roulement mis de côté (environ 10% des ventes) ?",
      options: [
        "À racheter les matières premières pour continuer à produire sans s'endetter",
        "À s'acheter des bijoux",
        "À faire des cadeaux de mariage"
      ],
      correctIndex: 0
    }
  ],
  mod_004: [
    {
      question: "Quel outil gratuit et simple permet de faire connaître son produit ?",
      options: [
        "Prendre de belles photos et utiliser régulièrement les statuts WhatsApp",
        "Acheter un panneau publicitaire géant en ville",
        "Créer une chaîne de télévision"
      ],
      correctIndex: 0
    },
    {
      question: "Pourquoi est-il conseillé de soigner la présentation d'un produit rural ?",
      options: [
        "Cela n'a pas d'importance pour les clientes",
        "Un produit propre et bien emballé donne confiance et peut se vendre plus cher",
        "C'est une obligation légale de l'ONU"
      ],
      correctIndex: 1
    }
  ],
  mod_005: [
    {
      question: "Pourquoi l'achat groupé de matières premières est-il avantageux ?",
      options: [
        "Cela permet d'aider le grossiste à vider son stock",
        "Cela permet d'obtenir de meilleurs prix d'achat et d'économiser sur le transport",
        "Pour passer du temps ensemble sur la route"
      ],
      correctIndex: 1
    }
  ],
  mod_006: [
    {
      question: "Que doit contenir un bon dossier de financement ?",
      options: [
        "Uniquement le nom de la demandeuse",
        "Le problème résolu, la solution, le budget, le nombre de bénéficiaires et un calendrier",
        "Une liste de vœux sans détails"
      ],
      correctIndex: 1
    },
    {
      question: "Quelles sont des sources de financement possibles citées dans la formation ?",
      options: [
        "Uniquement les prêts entre amies",
        "Microfinances locales, ONG, programmes gouvernementaux, banques agricoles",
        "Seulement les jeux d'argent"
      ],
      correctIndex: 1
    },
    {
      question: "Que doit contenir un bon pitch de 2 minutes devant un bailleur ?",
      options: [
        "Qui vous êtes, le problème, votre solution, le montant demandé et l'impact",
        "Un long historique familial sans lien avec le projet",
        "Uniquement le montant demandé, sans explication"
      ],
      correctIndex: 0
    }
  ]
};

// 2. Guide vocal (bêta) : synthèse vocale du navigateur (gratuite, sans API),
// limitée volontairement à la PREMIÈRE leçon de chaque formation.
const SPEECH_SUPPORTED = typeof window !== "undefined" && "speechSynthesis" in window;

// Découpe le texte de la première leçon en phrases courtes : chaque phrase est
// prononcée puis affichée en sous-titre, ce qui synchronise voix et texte.
function buildFirstLessonChunks(m: TrainingModule): string[] {
  const chunks: string[] = [
    `Bienvenue dans l'assistant vocal Éclosion. Formation : ${m.title}.`
  ];
  const first = m.sections?.[0];
  if (first) {
    chunks.push(`Leçon 1 : ${first.title}.`);
    const sentences = first.content.match(/[^.!?]+[.!?]*/g) || [first.content];
    chunks.push(...sentences.map((s) => s.trim()).filter(Boolean));
  } else {
    chunks.push(m.summary);
  }
  chunks.push("Fin de l'extrait vocal de la version bêta. Lisez la suite du cours à l'écran, puis passez le quiz !");
  return chunks;
}

export default function Formations({
  user,
  modules,
  downloadedIds,
  completedIds,
  favorites,
  onToggleFavorite,
  onToggleDownload,
  onToggleComplete,
  onDownloadAll,
}: FormationsProps) {
  
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);

  // Guide vocal states
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioIndex, setAudioIndex] = useState(0);
  const [audioChunks, setAudioChunks] = useState<string[]>([]);
  // Miroir de audioPlaying lisible dans les callbacks onend (évite les
  // fermetures périmées quand on arrête la lecture en cours de phrase).
  const playingRef = useRef(false);

  // Quiz interactive states
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Certificate Modal state
  const [showCertificate, setShowCertificate] = useState(false);

  const isCompleted = (id: string) => completedIds.includes(id);
  const isDownloaded = (id: string) => downloadedIds.includes(id);
  const isModuleFavorite = (id: string) => favorites.some((f) => f.kind === "module" && f.id === id);

  const completedCount = modules.filter((m) => isCompleted(m.module_id)).length;
  const progressPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;
  const allDownloaded = modules.length > 0 && downloadedIds.length >= modules.length;

  const stopAudio = () => {
    playingRef.current = false;
    if (SPEECH_SUPPORTED) window.speechSynthesis.cancel();
    setAudioPlaying(false);
  };

  // Coupe la voix si on quitte l'écran des formations
  useEffect(() => stopAudio, []);

  // Prononce les phrases une à une en mettant à jour sous-titre et progression
  const speakChunk = (chunks: string[], i: number) => {
    if (!playingRef.current) return;
    if (i >= chunks.length) {
      setAudioProgress(100);
      stopAudio();
      return;
    }
    setAudioIndex(i);
    setAudioProgress(Math.round((i / chunks.length) * 100));
    const utterance = new SpeechSynthesisUtterance(chunks[i]);
    utterance.lang = "fr-FR";
    utterance.rate = 0.95;
    utterance.onend = () => speakChunk(chunks, i + 1);
    utterance.onerror = () => stopAudio();
    window.speechSynthesis.speak(utterance);
  };

  // Repli sans voix (navigateur sans speechSynthesis) : défilement des sous-titres
  useEffect(() => {
    if (SPEECH_SUPPORTED || !audioPlaying || audioChunks.length === 0) return;
    const timer = setInterval(() => {
      setAudioIndex((prev) => {
        const next = prev + 1;
        if (next >= audioChunks.length) {
          setAudioProgress(100);
          setAudioPlaying(false);
          return prev;
        }
        setAudioProgress(Math.round((next / audioChunks.length) * 100));
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [audioPlaying, audioChunks]);

  // Handle active module audio toggle
  const handleToggleAudio = () => {
    if (audioPlaying) {
      stopAudio();
      return;
    }
    if (!selectedModule) return;
    const chunks = buildFirstLessonChunks(selectedModule);
    setAudioChunks(chunks);
    setAudioProgress(0);
    setAudioIndex(0);
    playingRef.current = true;
    setAudioPlaying(true);
    if (SPEECH_SUPPORTED) {
      window.speechSynthesis.cancel();
      speakChunk(chunks, 0);
    }
  };

  // Start Quiz
  const handleStartQuiz = () => {
    setQuizActive(true);
    setQuizQuestionIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setShowQuizResult(false);
    stopAudio(); // coupe le guide vocal
  };

  // Submit Answer
  const handleAnswerSubmit = (correctIdx: number) => {
    if (selectedOption === null) return;
    
    let nextScore = quizScore;
    if (selectedOption === correctIdx) {
      nextScore += 1;
      setQuizScore(nextScore);
    }

    const quizQuestions = MODULE_QUIZZES[selectedModule?.module_id || ""] || [];
    if (quizQuestionIdx < quizQuestions.length - 1) {
      setQuizQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // Finished
      setShowQuizResult(true);
      // If scored 100% or close (e.g. at least 2/3 or 100% depending on questions count)
      const passed = nextScore >= Math.ceil(quizQuestions.length * 0.7);
      if (passed && selectedModule) {
        // Automatically mark the module completed in the DB state
        if (!isCompleted(selectedModule.module_id)) {
          onToggleComplete(selectedModule.module_id);
        }
      }
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent, m: TrainingModule) => {
    e.stopPropagation();
    onToggleFavorite({
      id: m.module_id,
      kind: "module",
      title: m.title,
      subtitle: m.duration,
      description: m.summary,
      href: `/module/${m.module_id}`
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "compass": return <Compass size={22} className="text-on-brand-tertiary" />;
      case "file-text": return <FileText size={22} className="text-on-brand-tertiary" />;
      case "wallet": return <Wallet size={22} className="text-on-brand-tertiary" />;
      case "megaphone": return <Megaphone size={22} className="text-on-brand-tertiary" />;
      case "users": return <Users size={22} className="text-on-brand-tertiary" />;
      case "hand-coins": return <Coins size={22} className="text-on-brand-tertiary" />;
      default: return <BookOpen size={22} className="text-on-brand-tertiary" />;
    }
  };

  if (selectedModule) {
    const isModFav = isModuleFavorite(selectedModule.module_id);
    const isModDl = isDownloaded(selectedModule.module_id);
    const isModComp = isCompleted(selectedModule.module_id);
    const quizQuestions = MODULE_QUIZZES[selectedModule.module_id] || [];

    return (
      <div className="flex flex-col h-full bg-surface-main select-none relative">
        
        {/* Module Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-ter bg-white select-none shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <button 
              onClick={() => {
                setSelectedModule(null);
                setQuizActive(false);
                stopAudio();
              }}
              className="p-2 -ml-2 hover:bg-surface-sec rounded-full transition-all"
            >
              <ArrowLeft size={20} className="text-text-main" />
            </button>
            <h2 className="text-sm font-bold text-text-main truncate">
              {quizActive ? "Quiz d'évaluation" : "Lecture du cours"}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={() => onToggleFavorite({
                id: selectedModule.module_id,
                kind: "module",
                title: selectedModule.title,
                subtitle: selectedModule.duration,
                description: selectedModule.summary,
                href: `/module/${selectedModule.module_id}`
              })}
              className="p-2 text-text-ter hover:bg-surface-sec rounded-full transition-all"
            >
              <Star size={20} fill={isModFav ? "#D98A2C" : "none"} className={isModFav ? "text-brand-secondary" : "text-text-ter"} />
            </button>
            
            <button 
              onClick={() => onToggleDownload(selectedModule.module_id)}
              className="p-2 text-brand-primary hover:bg-surface-sec rounded-full transition-all"
            >
              {isModDl ? <CheckCircle size={20} className="text-success-main" /> : <Download size={20} />}
            </button>
          </div>
        </div>

        {/* Scrollable Reader */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 pb-28">
          
          <AnimatePresence mode="wait">
            {!quizActive ? (
              // LESSON CONTENT VIEW
              <motion.div 
                key="lesson"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-text-main leading-tight">
                    {selectedModule.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-text-ter">
                    <Clock size={12} />
                    <span>Durée d'étude : {selectedModule.duration}</span>
                  </div>
                </div>

                {/* Animated simulated Voice Synthesizer Button (Rural Access) */}
                <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-eclosion p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-full ${audioPlaying ? "bg-brand-primary text-white animate-pulse" : "bg-brand-primary/10 text-brand-primary"}`}>
                        {audioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text-main block">Écouter la leçon (Vocal)</span>
                        <p className="text-[10px] text-text-ter">Bêta : lecture vocale de la première leçon uniquement</p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleAudio}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        audioPlaying 
                          ? "bg-error-main/10 text-error-main hover:bg-error-main/15" 
                          : "bg-brand-primary text-white hover:bg-brand-primary/95"
                      }`}
                    >
                      {audioPlaying ? "Arrêter" : "Démarrer"}
                    </button>
                  </div>

                  {/* Audio simulation playback bar & subtitles */}
                  {audioPlaying && (
                    <div className="flex flex-col gap-2 mt-1 border-t border-brand-primary/10 pt-3 animate-fadeIn">
                      <div className="w-full bg-brand-primary/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${audioProgress}%` }} />
                      </div>
                      <p className="text-[11px] text-brand-primary italic leading-relaxed font-medium bg-white p-2.5 rounded border border-brand-primary/5 min-h-[46px] flex items-center">
                        "{audioChunks[audioIndex] || "Préparation de la lecture..."}"
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-text-sec leading-relaxed">
                  {selectedModule.summary}
                </p>

                {/* Course Chapters */}
                <div className="flex flex-col gap-4 mt-1">
                  {selectedModule.sections?.map((section, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-surface-ter p-4 rounded-eclosion flex flex-col gap-2 shadow-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#4A6B4E]/10 text-brand-primary flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <h3 className="text-sm font-bold text-text-main mt-1">{section.title}</h3>
                      <p className="text-xs text-text-sec leading-relaxed mt-0.5">{section.content}</p>
                    </div>
                  ))}
                </div>

                {/* Big Quiz Launch & Status Block */}
                <div className="bg-brand-tertiary border border-brand-primary/10 p-5 rounded-eclosion flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isModComp ? "bg-success-main text-white" : "bg-brand-primary/15 text-brand-primary"
                    }`}>
                      {isModComp ? <CheckCircle size={20} /> : <Award size={20} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-main">
                        {isModComp ? "Module validé avec brio !" : "Prête pour le quiz de validation ?"}
                      </h4>
                      <p className="text-[10px] text-text-ter">
                        {isModComp ? "Vous avez obtenu votre attestation officielle Éclosion." : "Répondez aux questions pour débloquer votre certificat de réussite."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    {isModComp && (
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 h-10 bg-brand-secondary hover:bg-brand-secondary/95 text-white text-xs font-bold rounded-eclosion transition-all shadow-sm"
                      >
                        <Award size={14} />
                        Voir mon attestation
                      </button>
                    )}
                    <button
                      onClick={handleStartQuiz}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 h-10 bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold rounded-eclosion transition-all shadow-sm"
                    >
                      <span>{isModComp ? "Refaire le quiz" : "Passer le Quiz"}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // ACTIVE QUIZ INTERACTIVE INTERFACE
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5"
              >
                {!showQuizResult ? (
                  // QUIZ QUESTIONS SCREEN
                  <div className="bg-white border border-surface-ter rounded-eclosion p-5 shadow-sm flex flex-col gap-5">
                    {/* Progress bar */}
                    <div className="flex items-center justify-between text-xs text-text-ter font-bold font-mono">
                      <span>Question {quizQuestionIdx + 1} sur {quizQuestions.length}</span>
                      <span className="text-brand-primary">{Math.round(((quizQuestionIdx) / quizQuestions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-surface-ter h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-primary h-full transition-all duration-300" style={{ width: `${((quizQuestionIdx) / quizQuestions.length) * 100}%` }} />
                    </div>

                    {/* Question title */}
                    <h2 className="text-base font-bold text-text-main leading-snug">
                      {quizQuestions[quizQuestionIdx]?.question}
                    </h2>

                    {/* Options cards (touch targets minimum 44px) */}
                    <div className="flex flex-col gap-3">
                      {quizQuestions[quizQuestionIdx]?.options.map((option, idx) => {
                        const isSel = selectedOption === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedOption(idx)}
                            className={`w-full min-h-[50px] px-4 py-3 text-left text-xs rounded-eclosion border transition-all flex items-center gap-3 ${
                              isSel 
                                ? "bg-brand-primary/5 border-brand-primary text-brand-primary font-semibold" 
                                : "bg-surface-sec border-surface-ter text-text-sec hover:border-text-ter"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSel ? "border-brand-primary bg-brand-primary text-white" : "border-surface-ter bg-white"
                            }`}>
                              {isSel && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="leading-snug">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Footer buttons */}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => setQuizActive(false)}
                        className="flex-1 py-2.5 bg-surface-sec border border-surface-ter text-text-sec text-xs font-bold rounded-eclosion transition-all hover:bg-surface-ter active:scale-95"
                      >
                        Quitter
                      </button>
                      <button
                        disabled={selectedOption === null}
                        onClick={() => handleAnswerSubmit(quizQuestions[quizQuestionIdx].correctIndex)}
                        className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/95 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-eclosion transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>{quizQuestionIdx === quizQuestions.length - 1 ? "Terminer" : "Suivant"}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  // QUIZ RESULT RECAP SCREEN
                  <div className="bg-white border border-surface-ter rounded-eclosion p-6 shadow-sm flex flex-col items-center text-center gap-5">
                    {/* Score icon Badge */}
                    {quizScore >= Math.ceil(quizQuestions.length * 0.7) ? (
                      <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center animate-bounce">
                        <Award size={36} />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-error-main/10 text-error-main flex items-center justify-center">
                        <RotateCcw size={36} />
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-bold text-text-main">
                        {quizScore >= Math.ceil(quizQuestions.length * 0.7) 
                          ? "Félicitations ! Vous avez réussi !" 
                          : "Vous y êtes presque !"}
                      </h2>
                      <p className="text-xs text-text-ter mt-1 leading-normal">
                        Score final : <strong className="text-text-main">{quizScore} sur {quizQuestions.length}</strong> réponses correctes.
                      </p>
                    </div>

                    <p className="text-xs text-text-sec max-w-sm leading-relaxed">
                      {quizScore >= Math.ceil(quizQuestions.length * 0.7)
                        ? "Votre investissement porte ses fruits. L'attestation officielle de réussite Éclosion a été ajoutée à votre profil de formation."
                        : "Prenez le temps de relire le cours pour bien mémoriser les notions et réessayez. La persévérance mène au succès !"}
                    </p>

                    <div className="flex flex-col gap-2.5 w-full mt-2">
                      {quizScore >= Math.ceil(quizQuestions.length * 0.7) ? (
                        <>
                          <button
                            onClick={() => {
                              setShowCertificate(true);
                              setQuizActive(false);
                            }}
                            className="w-full py-3 bg-brand-secondary hover:bg-brand-secondary/95 text-white font-bold text-xs rounded-eclosion shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <Award size={15} />
                            Découvrir mon attestation 🎓
                          </button>
                          <button
                            onClick={() => {
                              setQuizActive(false);
                            }}
                            className="w-full py-2.5 bg-surface-sec text-text-sec font-bold text-xs rounded-eclosion transition-all hover:bg-surface-ter active:scale-95"
                          >
                            Retourner au cours
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleStartQuiz}
                            className="w-full py-3 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-xs rounded-eclosion shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <RotateCcw size={15} />
                            Recommencer le quiz
                          </button>
                          <button
                            onClick={() => {
                              setQuizActive(false);
                            }}
                            className="w-full py-2.5 bg-surface-sec text-text-sec font-bold text-xs rounded-eclosion transition-all hover:bg-surface-ter active:scale-95"
                          >
                            Relire la leçon
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Certificate Golden Botanical Overlay Modal */}
        <AnimatePresence>
          {showCertificate && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/75 flex items-center justify-center p-4 select-none"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-[#FCF9F5] border-[6px] border-brand-primary rounded-lg max-w-sm w-full p-6 text-text-main flex flex-col items-center shadow-2xl relative overflow-hidden text-center"
              >
                {/* Botanical corner icons decoration */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-secondary/30" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-secondary/30" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-secondary/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-secondary/30" />

                {/* Sparkling icon */}
                <div className="absolute top-4 right-4 text-brand-secondary opacity-60 animate-spin">
                  <Sparkles size={16} />
                </div>

                {/* Seal / Emblem */}
                <div className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center mb-4 shadow-md border-2 border-brand-secondary">
                  <Award size={28} />
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-secondary block mb-1">
                  Afrique Centrale
                </span>
                <h2 className="text-lg font-bold text-brand-primary tracking-tight leading-snug">
                  ATTESTATION DE RÉUSSITE
                </h2>
                <div className="w-24 h-0.5 bg-brand-secondary my-3.5" />

                <p className="text-[10px] text-text-ter italic">
                  Décernée solennellement et avec fierté à :
                </p>
                <h3 className="text-base font-bold text-text-main mt-1.5 uppercase tracking-wide leading-tight px-1 py-1.5 border-b border-surface-ter w-full">
                  {user?.name || "Mireille Alogo"}
                </h3>

                <p className="text-[10px] text-text-ter mt-3 leading-relaxed max-w-[240px]">
                  pour avoir validé l'ensemble des connaissances et exercices pratiques du module :
                </p>
                <h4 className="text-xs font-bold text-brand-primary mt-1 px-4 py-1">
                  "{selectedModule.title}"
                </h4>

                <div className="mt-5 w-full flex justify-between items-end border-t border-surface-ter pt-4 px-2 select-none">
                  <div className="text-left">
                    <span className="text-[8px] text-text-ter block">Date de réussite</span>
                    <span className="text-[9px] font-bold text-text-main font-mono">
                      {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-text-ter block">Validation</span>
                    <span className="text-[9px] font-bold text-brand-secondary font-mono tracking-wider">
                      ÉCLOSION v1.0
                    </span>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-2.5 w-full mt-6">
                  <button
                    onClick={() => {
                      alert("Attestation partagée sur WhatsApp rutilante ! Vos collègues de coopérative et financeurs peuvent vérifier vos acquis d'affaires.");
                    }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white text-[11px] font-bold rounded-eclosion shadow-sm transition-all"
                  >
                    <Share2 size={12} />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="flex-1 py-2 bg-surface-sec text-text-sec text-[11px] font-bold rounded-eclosion border border-surface-ter transition-all hover:bg-surface-ter"
                  >
                    Fermer
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface-main select-none">
      
      {/* Formations list Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white border-b border-surface-ter select-none">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-text-main leading-tight truncate">Formations</h2>
          <p className="text-xs text-text-ter leading-snug mt-0.5">
            {completedCount}/{modules.length} cours validé(s) • {downloadedIds.length} hors ligne
          </p>
          
          <div className="w-full bg-surface-ter h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-success-main h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button 
          onClick={onDownloadAll}
          disabled={allDownloaded}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm shrink-0 transition-all ${
            allDownloaded 
              ? "bg-surface-sec text-success-main border border-success-main/10" 
              : "bg-brand-tertiary text-brand-primary border border-brand-primary/10 hover:bg-brand-tertiary/80"
          }`}
        >
          <Download size={12} className={allDownloaded ? "text-success-main" : "text-brand-primary"} />
          <span>{allDownloaded ? "Tout enregistré" : "Tout charger"}</span>
        </button>
      </div>

      {/* Grid of educational cards */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-3.5">
          {modules.map((m) => {
            const hasDl = isDownloaded(m.module_id);
            const hasComp = isCompleted(m.module_id);
            const hasFav = isModuleFavorite(m.module_id);

            return (
              <div 
                key={m.module_id}
                onClick={() => setSelectedModule(m)}
                className="bg-white border border-surface-ter rounded-eclosion p-4 flex flex-col gap-3 shadow-sm hover:border-brand-primary/20 transition-all active:scale-[0.98] select-none cursor-pointer text-left"
              >
                <div className="flex justify-between items-start gap-1">
                  <div className="w-10 h-10 rounded-full bg-brand-tertiary flex items-center justify-center shrink-0 border border-surface-ter">
                    {getIcon(m.icon)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleFavoriteClick(e, m)}
                      className="p-1 hover:text-brand-secondary transition-all shrink-0"
                    >
                      <Star size={13} fill={hasFav ? "#D98A2C" : "none"} className={hasFav ? "text-brand-secondary" : "text-text-ter"} />
                    </button>
                    {hasComp ? (
                      <div className="w-5 h-5 rounded-full bg-brand-secondary text-white flex items-center justify-center font-bold text-[9px] shrink-0 border border-surface-ter">
                        ✓
                      </div>
                    ) : hasDl ? (
                      <div className="w-5 h-5 rounded-full bg-success-main text-white flex items-center justify-center font-bold text-[9px] shrink-0 border border-surface-ter">
                        ↓
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1 min-h-[50px]">
                  <h3 className="text-sm font-bold text-text-main line-clamp-2 leading-snug">{m.title}</h3>
                  <p className="text-[11px] text-text-ter line-clamp-3 leading-relaxed mt-0.5">{m.summary}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-text-ter border-t border-surface-ter pt-2 mt-auto select-none">
                  <Clock size={10} />
                  <span>{m.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
