import { Donor } from './types';

export const SEED_DONORS: Omit<Donor, 'avg_rating' | 'rating_count'>[] = [
  // Cameroun
  {
    donor_id: "d_cm_01",
    name: "ONU Femmes Cameroun",
    type: "ONG internationale",
    country: "Cameroun",
    sectors: ["Tous"],
    description: "Programmes d'autonomisation économique des femmes, subventions pour coopératives.",
    phone: "+237 222 50 47 47",
    website: "https://africa.unwomen.org/fr/where-we-are/west-and-central-africa/cameroon",
    city: "Yaoundé"
  },
  {
    donor_id: "d_cm_02",
    name: "ACEFA - Programme d'Appui aux Filières Agropastorales",
    type: "Programme gouvernemental",
    country: "Cameroun",
    sectors: ["Agriculture", "Élevage"],
    description: "Subventions matching pour groupes producteurs (40-70% du coût du projet).",
    phone: "+237 222 22 51 96",
    website: "https://www.acefa.cm",
    city: "Yaoundé"
  },
  {
    donor_id: "d_cm_03",
    name: "MC² (Mutuelle Communautaire de Croissance)",
    type: "Microfinance",
    country: "Cameroun",
    sectors: ["Tous"],
    description: "Réseau de mutuelles villageoises, crédits adaptés aux femmes rurales (50 000 - 2M FCFA).",
    phone: "+237 233 42 26 26",
    website: "https://www.adafmc2.org",
    city: "Bafoussam"
  },
  {
    donor_id: "d_cm_04",
    name: "Plan International Cameroun",
    type: "ONG internationale",
    country: "Cameroun",
    sectors: ["Artisanat", "Agriculture"],
    description: "Subventions et formation pour groupes de femmes et jeunes filles.",
    phone: "+237 222 21 39 80",
    website: "https://plan-international.org/cameroon",
    city: "Yaoundé"
  },
  // Gabon
  {
    donor_id: "d_ga_01",
    name: "FODEX (Fonds Gabonais de l'Entrepreneuriat)",
    type: "Programme gouvernemental",
    country: "Gabon",
    sectors: ["Tous"],
    description: "Financement TPE/PME, crédit à partir de 500 000 FCFA, taux préférentiel femmes.",
    phone: "+241 11 76 51 79",
    website: "https://fodex.ga",
    city: "Libreville"
  },
  {
    donor_id: "d_ga_02",
    name: "ONU Femmes Gabon",
    type: "ONG internationale",
    country: "Gabon",
    sectors: ["Tous"],
    description: "Appui à l'entrepreneuriat féminin et programmes communautaires.",
    phone: "+241 11 73 84 21",
    website: "https://africa.unwomen.org",
    city: "Libreville"
  },
  {
    donor_id: "d_ga_03",
    name: "Caisse de Dépôts et de Consignations Gabon",
    type: "Banque publique",
    country: "Gabon",
    sectors: ["Tous"],
    description: "Crédits aux coopératives rurales, programmes inclusion financière.",
    phone: "+241 11 79 79 79",
    website: "https://cdc.ga",
    city: "Libreville"
  },
  // RDC
  {
    donor_id: "d_cd_01",
    name: "FPI (Fonds de Promotion de l'Industrie)",
    type: "Programme gouvernemental",
    country: "RDC",
    sectors: ["Artisanat", "Agriculture", "Élevage"],
    description: "Crédits long terme pour PME et coopératives, taux 9%.",
    phone: "+243 815 555 555",
    website: "https://fpi.cd",
    city: "Kinshasa"
  },
  {
    donor_id: "d_cd_02",
    name: "FINCA RDC",
    type: "Microfinance",
    country: "RDC",
    sectors: ["Tous"],
    description: "Crédits solidaires pour groupes de femmes (à partir de 100 USD).",
    phone: "+243 999 911 011",
    website: "https://finca.cd",
    city: "Kinshasa"
  },
  {
    donor_id: "d_cd_03",
    name: "PADMPME (Projet d'Appui au Développement des MPME)",
    type: "Programme gouvernemental",
    country: "RDC",
    sectors: ["Tous"],
    description: "Subventions matching grants jusqu'à 50 000 USD, financé par Banque Mondiale.",
    phone: "+243 815 015 015",
    website: "https://padmpme.cd",
    city: "Kinshasa"
  },
  {
    donor_id: "d_cd_04",
    name: "Vision Fund RDC",
    type: "Microfinance",
    country: "RDC",
    sectors: ["Agriculture", "Artisanat"],
    description: "Microcrédits ruraux, focus femmes et familles vulnérables.",
    phone: "+243 970 010 010",
    website: "https://visionfund.org/dr-congo",
    city: "Goma"
  },
  // RCA
  {
    donor_id: "d_cf_01",
    name: "PNUD RCA - Programme Relèvement",
    type: "ONG internationale",
    country: "RCA",
    sectors: ["Tous"],
    description: "Subventions pour coopératives féminines, accompagnement business.",
    phone: "+236 21 61 30 00",
    website: "https://www.undp.org/fr/central-african-republic",
    city: "Bangui"
  },
  {
    donor_id: "d_cf_02",
    name: "Catholic Relief Services (CRS) RCA",
    type: "ONG internationale",
    country: "RCA",
    sectors: ["Agriculture", "Élevage"],
    description: "Programmes SILC (épargne et crédit) pour groupes de femmes.",
    phone: "+236 75 50 23 91",
    website: "https://www.crs.org/our-work-overseas/where-we-work/central-african-republic",
    city: "Bangui"
  },
  {
    donor_id: "d_cf_03",
    name: "COOPEC Centrafrique",
    type: "Microfinance",
    country: "RCA",
    sectors: ["Tous"],
    description: "Réseau de coopératives d'épargne et de crédit, services adaptés aux groupes ruraux.",
    phone: "+236 21 61 09 60",
    website: "https://coopec-ca.org",
    city: "Bangui"
  },
  // Congo
  {
    donor_id: "d_cg_01",
    name: "MUCODEC (Mutuelle Congolaise d'Épargne et de Crédit)",
    type: "Microfinance",
    country: "Congo",
    sectors: ["Tous"],
    description: "1er réseau microfinance du Congo, crédits à partir de 50 000 FCFA pour groupes.",
    phone: "+242 06 666 60 60",
    website: "https://mucodec.com",
    city: "Brazzaville"
  },
  {
    donor_id: "d_cg_02",
    name: "PRODER (Projet de Développement Rural)",
    type: "Programme gouvernemental",
    country: "Congo",
    sectors: ["Agriculture", "Élevage"],
    description: "Subventions matériel et formation pour groupements agricoles.",
    phone: "+242 06 624 24 24",
    website: "https://agriculture.gouv.cg",
    city: "Brazzaville"
  },
  {
    donor_id: "d_cg_03",
    name: "ONU Femmes Congo",
    type: "ONG internationale",
    country: "Congo",
    sectors: ["Tous"],
    description: "Programmes d'autonomisation économique en zones rurales.",
    phone: "+242 06 612 12 12",
    website: "https://africa.unwomen.org",
    city: "Brazzaville"
  },
  {
    donor_id: "d_cg_04",
    name: "Forum des Femmes Africaines (FAWE Congo)",
    type: "ONG locale",
    country: "Congo",
    sectors: ["Artisanat", "Agriculture"],
    description: "Subventions et mentorat pour entreprises féminines rurales.",
    phone: "+242 05 555 55 55",
    website: "https://fawe.org",
    city: "Pointe-Noire"
  },
  // Tchad
  {
    donor_id: "d_td_01",
    name: "ONU Femmes Tchad",
    type: "ONG internationale",
    country: "Tchad",
    sectors: ["Tous"],
    description: "Programmes d'autonomisation économique et appui aux groupements féminins.",
    phone: "+235 22 51 80 64",
    website: "https://africa.unwomen.org",
    city: "N'Djamena"
  },
  {
    donor_id: "d_td_02",
    name: "PARSAT (Projet d'Appui à la Résilience et Sécurité Alimentaire)",
    type: "Programme gouvernemental",
    country: "Tchad",
    sectors: ["Agriculture", "Élevage"],
    description: "Subventions matériel et formation pour coopératives rurales (cofinancement FIDA).",
    phone: "+235 22 52 31 47",
    website: "https://www.ifad.org/fr/web/operations/-/project/2000001255",
    city: "N'Djamena"
  },
  {
    donor_id: "d_td_03",
    name: "URCOOPEC Tchad",
    type: "Microfinance",
    country: "Tchad",
    sectors: ["Tous"],
    description: "Réseau d'unions de coopératives d'épargne et de crédit pour zones rurales.",
    phone: "+235 22 52 88 11",
    website: "https://urcoopec.org",
    city: "N'Djamena"
  },
  {
    donor_id: "d_td_04",
    name: "PNUD Tchad - Programme MPME",
    type: "ONG internationale",
    country: "Tchad",
    sectors: ["Artisanat", "Agriculture"],
    description: "Subventions pour micro et petites entreprises portées par les femmes.",
    phone: "+235 22 52 27 56",
    website: "https://www.undp.org/fr/chad",
    city: "N'Djamena"
  },
  // Guinée Équatoriale
  {
    donor_id: "d_gq_01",
    name: "FOGAPYME (Fonds de Garantie PME)",
    type: "Programme gouvernemental",
    country: "Guinée Équatoriale",
    sectors: ["Tous"],
    description: "Garantie de crédit pour PME locales, accès facilité pour groupes structurés.",
    phone: "+240 333 09 25 25",
    website: "https://www.guineaecuatorialpress.com",
    city: "Malabo"
  },
  {
    donor_id: "d_gq_02",
    name: "PNUD Guinée Équatoriale",
    type: "ONG internationale",
    country: "Guinée Équatoriale",
    sectors: ["Tous"],
    description: "Appui aux initiatives communautaires et autonomisation des femmes rurales.",
    phone: "+240 333 09 28 87",
    website: "https://www.undp.org/fr/equatorial-guinea",
    city: "Malabo"
  },
  {
    donor_id: "d_gq_03",
    name: "CCEI Bank GE - Programme TPE",
    type: "Banque publique",
    country: "Guinée Équatoriale",
    sectors: ["Artisanat", "Agriculture"],
    description: "Microcrédits adaptés aux très petites entreprises et coopératives villageoises.",
    phone: "+240 333 09 33 99",
    website: "https://www.cceibankge.com",
    city: "Bata"
  },
  {
    donor_id: "d_gq_04",
    name: "Caritas Guinée Équatoriale",
    type: "ONG locale",
    country: "Guinée Équatoriale",
    sectors: ["Agriculture", "Artisanat"],
    description: "Subventions et accompagnement de projets communautaires en milieu rural.",
    phone: "+240 222 00 00 00",
    website: "https://caritas.org",
    city: "Malabo"
  },
];
