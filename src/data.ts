import { Opportunity, Donor, TrainingModule } from './types';
import cassavaImg from "./assets/images/cassava_transformation_1783507801897.jpg";
import soapImg from "./assets/images/soap_making_1783507813515.jpg";
import coutureImg from "./assets/images/couture_confection_1783507890462.jpg";
import welcomeImg from "./assets/images/welcome_bg_afep3_1783507778316.jpg";

import { SEED_DONORS } from "./donors_data";
export { SEED_DONORS };

export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    opp_id: "opp_001",
    title: "Transformation du manioc en farine",
    sector: "Agriculture",
    location: "Région du Centre, Cameroun",
    description: "Forte demande en farine de manioc dans les marchés urbains. Marge bénéficiaire élevée avec un équipement de transformation simple (vêtements et pagnes officiels de l'association AFEP-3.0).",
    image_url: cassavaImg,
    featured: true,
  },
  {
    opp_id: "opp_002",
    title: "Production de savon artisanal à l'huile de palme",
    sector: "Artisanat",
    location: "Province Orientale, RDC",
    description: "Matières premières locales disponibles. Marché en croissance pour les produits naturels (animatrices formées en tenue de pagne officiel AFEP-3.0).",
    image_url: soapImg,
    featured: false,
  },
  {
    opp_id: "opp_003",
    title: "Apiculture et vente de miel",
    sector: "Agriculture",
    location: "Plateaux, Gabon",
    description: "Investissement modeste, retour rapide. Le miel rural est très recherché en ville (groupements soutenus par AFEP-3.0).",
    image_url: welcomeImg,
    featured: false,
  },
  {
    opp_id: "opp_004",
    title: "Élevage de poulets de chair",
    sector: "Élevage",
    location: "Brazzaville, Congo",
    description: "Cycle court (45 jours), forte demande urbaine. Idéal pour démarrer avec un petit groupe (sous l'égide de l'association AFEP-3.0).",
    image_url: welcomeImg,
    featured: false,
  },
  {
    opp_id: "opp_005",
    title: "Couture et confection de pagnes",
    sector: "Artisanat",
    location: "Bangui, RCA",
    description: "Marché local stable. Confection des pagnes officiels de l'association AFEP-3.0 à motifs de spirales rouges et jaunes.",
    image_url: coutureImg,
    featured: false,
  },
];

export const TRAINING_MODULES: TrainingModule[] = [
  {
    module_id: "mod_001",
    title: "Identifier une opportunité d'affaires",
    icon: "compass",
    duration: "20 min",
    summary: "Apprenez à observer votre communauté pour découvrir des besoins non satisfaits.",
    sections: [
      {
        title: "Observer son environnement",
        content: "Commencez par regarder autour de vous. Quels produits manquent au marché ? Que vos voisines achètent-elles ailleurs ? Notez chaque idée dans un cahier pendant une semaine."
      },
      {
        title: "Écouter les besoins",
        content: "Posez des questions simples : 'Qu'aimeriez-vous acheter plus facilement ?', 'Quel produit est trop cher ou trop loin ?'. Les meilleures idées viennent des conversations."
      },
      {
        title: "Évaluer la faisabilité",
        content: "Pour chaque idée : Ai-je les matières premières ? Combien de personnes sont prêtes à acheter ? À quel prix ? Y a-t-il déjà beaucoup de concurrentes ?"
      },
    ],
  },
  {
    module_id: "mod_002",
    title: "Créer son plan d'affaires",
    icon: "file-text",
    duration: "30 min",
    summary: "Structurez votre projet en 5 étapes claires.",
    sections: [
      {
        title: "Le produit ou service",
        content: "Décrivez précisément ce que vous vendez. À qui ? Quel est l'avantage par rapport à ce qui existe ?"
      },
      {
        title: "Les coûts de départ",
        content: "Listez tous les achats nécessaires : matériel, matières premières pour 1 mois, transport. Additionnez."
      },
      {
        title: "Le prix de vente",
        content: "Calculez le coût pour produire une unité, ajoutez votre marge (30-50%). Comparez avec les concurrents."
      },
      {
        title: "Le plan de vente",
        content: "Où vendrez-vous ? Marché, à domicile, livraison ? Combien d'unités par semaine ?"
      },
    ],
  },
  {
    module_id: "mod_003",
    title: "Gérer son argent",
    icon: "wallet",
    duration: "25 min",
    summary: "Séparer l'argent du business et celui de la maison.",
    sections: [
      {
        title: "Tenir un cahier de comptes",
        content: "Chaque jour, notez : ce qui rentre (ventes) et ce qui sort (achats, transport). Une page par jour suffit."
      },
      {
        title: "Mettre de côté",
        content: "Avant tout, mettez 10% des ventes dans une boîte fermée. C'est votre fonds de roulement pour racheter les matières premières."
      },
      {
        title: "Tontine et épargne",
        content: "Rejoignez une tontine du groupe. C'est un excellent moyen d'épargner et d'accéder à un capital plus important pour grandir."
      },
    ],
  },
  {
    module_id: "mod_004",
    title: "Vendre et communiquer",
    icon: "megaphone",
    duration: "20 min",
    summary: "Faire connaître son produit sans publicité chère.",
    sections: [
      {
        title: "Le bouche-à-oreille",
        content: "Vos premières clientes sont vos meilleures vendeuses. Offrez un petit cadeau à celle qui amène 3 nouvelles clientes."
      },
      {
        title: "WhatsApp et statuts",
        content: "Prenez de belles photos de vos produits. Postez-les en statut WhatsApp 2 fois par semaine. Créez un groupe 'Mes clientes'."
      },
      {
        title: "Soigner la présentation",
        content: "Un produit bien emballé se vend deux fois plus cher. Utilisez un papier propre, une étiquette avec votre nom."
      },
    ],
  },
  {
    module_id: "mod_005",
    title: "Grandir en groupe",
    icon: "users",
    duration: "15 min",
    summary: "La force du collectif pour aller plus loin.",
    sections: [
      {
        title: "Acheter ensemble",
        content: "Achetez les matières premières en gros avec le groupe. Vous obtiendrez de meilleurs prix et économiserez le transport."
      },
      {
        title: "Se former mutuellement",
        content: "Chaque membre a une compétence. Organisez une réunion mensuelle où une membre enseigne aux autres."
      },
      {
        title: "Chercher un financement collectif",
        content: "Les bailleurs préfèrent financer des groupes structurés plutôt que des individus. Préparez votre projet ensemble."
      },
    ],
  },
  {
    module_id: "mod_006",
    title: "Demander un financement",
    icon: "hand-coins",
    duration: "25 min",
    summary: "Présenter son projet à des bailleurs et microfinances.",
    sections: [
      {
        title: "Préparer un dossier solide",
        content: "Un bon dossier contient : le problème résolu, votre solution, le budget, le nombre de bénéficiaires et un calendrier."
      },
      {
        title: "Les sources de financement",
        content: "Microfinances locales, ONG (Plan International, ONU Femmes), programmes gouvernementaux, banques agricoles. Visitez l'agence la plus proche."
      },
      {
        title: "Pitcher en 2 minutes",
        content: "Phrase 1 : Qui vous êtes. Phrase 2 : Le problème. Phrase 3 : Votre solution. Phrase 4 : Le montant et l'impact. Entraînez-vous devant le groupe."
      },
    ],
  },
];
