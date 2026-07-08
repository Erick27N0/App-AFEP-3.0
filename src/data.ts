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
    title: "Culture et récolte collective de tomates",
    sector: "Agriculture",
    location: "Région du Centre, Cameroun",
    description: "Forte demande de tomates fraîches sur les marchés urbains. La récolte en groupe et la vente en cagettes augmentent les marges des cultivatrices du réseau AFEP-3.0.",
    image_url: cassavaImg,
    featured: true,
  },
  {
    opp_id: "opp_002",
    title: "Maraîchage : gombo et légumes verts",
    sector: "Agriculture",
    location: "Province Orientale, RDC",
    description: "Le gombo se récolte presque toute l'année et se vend rapidement. Culture collective à cycle court, encadrée par les animatrices AFEP-3.0.",
    image_url: soapImg,
    featured: false,
  },
  {
    opp_id: "opp_003",
    title: "Vente groupée au marché",
    sector: "Commerce",
    location: "Plateaux, Gabon",
    description: "Vendre ensemble au marché permet de négocier de meilleurs prix, de partager les frais de transport et de fidéliser la clientèle (étals tenus par les groupements AFEP-3.0).",
    image_url: welcomeImg,
    featured: false,
  },
  {
    opp_id: "opp_004",
    title: "Transformation de la tomate : purée et séchage",
    sector: "Transformation",
    location: "Brazzaville, Congo",
    description: "Transformer les surplus de récolte en purée ou en tomates séchées évite les pertes et permet de vendre toute l'année (sous l'égide de l'association AFEP-3.0).",
    image_url: cassavaImg,
    featured: false,
  },
  {
    opp_id: "opp_005",
    title: "Tissage et teinture de pagnes",
    sector: "Artisanat",
    location: "Bangui, RCA",
    description: "Marché local stable. Tissage sur métier et teinture des pagnes officiels de l'association AFEP-3.0 dans un atelier collectif.",
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
