import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { SEED_DONORS } from "./src/data";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent JSON Database path
const DB_FILE = path.join(process.cwd(), "db_state.json");

interface DbState {
  users: any[];
  groups: any[];
  groupMessages: any[];
  donorRatings: any[];
  fundingRequests: any[];
  testerFeedbacks: any[];
}

const DEFAULT_DB: DbState = {
  users: [
    {
      user_id: "user_demo_1",
      email: "demo@eclosion.local",
      name: "Mireille Démo",
      picture: "",
      group_id: "grp_demo_1"
    }
  ],
  groups: [
    {
      group_id: "grp_demo_1",
      name: "Coopérative des Femmes de Bafia",
      description: "12 femmes courageuses spécialisées dans la production, transformation et ensachage de farine de manioc pure.",
      location: "Bafia, Cameroun",
      members: ["user_demo_1"],
      created_by: "user_demo_1"
    },
    {
      group_id: "grp_demo_2",
      name: "Association des Artisanes de Pointe-Noire",
      description: "Atelier collectif de couture, broderie et de teinture de pagnes traditionnels gabonais et congolais.",
      location: "Pointe-Noire, Congo",
      members: [],
      created_by: "system"
    }
  ],
  groupMessages: [
    {
      message_id: "msg_1",
      group_id: "grp_demo_1",
      user_id: "system",
      user_name: "Éclosion Assistance",
      content: "Bienvenue dans le salon de discussion de votre coopérative ! Échangez ici avec vos membres pour planifier vos activités et coordonner la transformation.",
      created_at: new Date().toISOString()
    }
  ],
  donorRatings: [
    {
      donor_id: "d_cm_02",
      user_name: "Aïcha (Bafia)",
      stars: 5,
      outcome: "funded",
      comment: "Le programme ACEFA a entièrement financé notre presse à manioc mécanique ! L'accompagnement sur le terrain était formidable.",
      created_at: new Date().toISOString()
    },
    {
      donor_id: "d_cm_02",
      user_name: "Marie-Louise",
      stars: 4,
      outcome: "responded",
      comment: "Dossier exigeant mais le comité d'évaluation étudie sérieusement chaque proposition rurale.",
      created_at: new Date().toISOString()
    }
  ],
  fundingRequests: [
    {
      request_id: "fund_demo_1",
      user_id: "user_demo_1",
      group_id: "grp_demo_1",
      project_name: "Unité Mobile de Presse de Manioc",
      sector: "Agriculture",
      problem: "Le manioc frais commence à pourrir sous 48h s'il n'est pas pressé et séché au village.",
      solution: "Acheter une presse mobile collective sur roues pour faire le pressage à tour de rôle.",
      target_amount: "500 000 FCFA",
      beneficiaries: "15 femmes de la coopérative",
      pitch: "## Résumé exécutif\nLa Coopérative des Femmes de Bafia sollicite un financement de **500 000 FCFA** pour acquérir une unité de pressage de manioc mobile et partagée.\n\n## Le problème\nLe manioc frais récolté pourrit extrêmement vite si le pressage n'est pas réalisé dans les 48 heures suivant l'arrachage, causant d'importantes pertes financières aux cultivatrices.\n\n## Notre solution\nUne presse mécanique robuste montée sur un châssis mobile qui circulera entre les exploitations des membres pour accélérer le processus de râpage et d'essorage du manioc sur place.\n\n## Bénéficiaires & impact\n15 femmes agricultrices et plus de 60 enfants bénéficieront directement d'une hausse de rendement de 40% sur la transformation de la farine.\n\n## Plan d'utilisation des fonds\n- Acquisition de la presse en acier inoxydable (65%)\n- Châssis mobile et roues renforcées (20%)\n- Formation technique à l'entretien (15%)\n\n## Pourquoi nous soutenir\nUn groupe de femmes actives et soudées ayant 3 ans d'expérience dans la culture maraîchère.",
      ai_generated: true,
      status: "draft",
      created_at: new Date().toISOString()
    }
  ],
  testerFeedbacks: []
};

function readDb(): DbState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading db_state.json, fallback to in-memory template:", err);
  }
  return DEFAULT_DB;
}

function writeDb(data: DbState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db_state.json:", err);
  }
}

// Initialize database file
if (!fs.existsSync(DB_FILE)) {
  writeDb(DEFAULT_DB);
}

// ---------------- Initialize Gemini Client ----------------
// We use lazy initialization and fail-safe fallbacks if key is missing or invalid.
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return aiClient;
}

// ---------------- API Endpoints ----------------

// Config
app.get("/api/config", (req, res) => {
  res.json({ demo_mode: true });
});

// User Session Simulation
app.post("/api/auth/session", (req, res) => {
  const { session_token, email, name } = req.body;
  const dbState = readDb();
  
  let existingUser = dbState.users.find(u => u.email === email);
  if (!existingUser) {
    existingUser = {
      user_id: "user_" + Math.random().toString(36).substring(2, 10),
      email: email || "user@eclosion.local",
      name: name || "Utilisatrice Éclosion",
      picture: "",
      group_id: null
    };
    dbState.users.push(existingUser);
    writeDb(dbState);
  }
  
  res.json({ session_token: session_token || "session_" + Math.random().toString(36).substring(2, 12), user: existingUser });
});

// Get Current User Profile
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  
  const dbState = readDb();
  // Simply mock successful authentication or fetch user by ID/token if needed
  // In demo mode we match default demo user or latest registered
  const user = dbState.users[dbState.users.length - 1] || DEFAULT_DB.users[0];
  res.json(user);
});

// Demo Login Shortcut
app.post("/api/auth/demo-login", (req, res) => {
  const dbState = readDb();
  const demoUser = dbState.users.find(u => u.email === "demo@eclosion.local") || DEFAULT_DB.users[0];
  res.json({
    session_token: "demo_token_" + Math.random().toString(36).substring(2, 10),
    user: demoUser
  });
});

// Group creation
app.post("/api/groups", (req, res) => {
  const { name, description, location, userId } = req.body;
  const dbState = readDb();
  
  const group_id = "grp_" + Math.random().toString(36).substring(2, 10);
  const newGroup = {
    group_id,
    name,
    description,
    location,
    members: [userId || "user_demo_1"],
    created_by: userId || "user_demo_1"
  };
  
  dbState.groups.push(newGroup);
  
  // Update user's group association
  const user = dbState.users.find(u => u.user_id === (userId || "user_demo_1"));
  if (user) {
    user.group_id = group_id;
  }
  
  writeDb(dbState);
  res.json(newGroup);
});

// List Groups
app.get("/api/groups", (req, res) => {
  const dbState = readDb();
  res.json(dbState.groups);
});

// Join group
app.post("/api/groups/:group_id/join", (req, res) => {
  const { group_id } = req.params;
  const { userId } = req.body;
  const dbState = readDb();
  
  const group = dbState.groups.find(g => g.group_id === group_id);
  if (!group) {
    return res.status(404).json({ error: "Groupe introuvable" });
  }
  
  const targetUser = userId || "user_demo_1";
  if (!group.members.includes(targetUser)) {
    group.members.push(targetUser);
  }
  
  const user = dbState.users.find(u => u.user_id === targetUser);
  if (user) {
    user.group_id = group_id;
  }
  
  writeDb(dbState);
  res.json(group);
});

// Leave group
app.post("/api/groups/:group_id/leave", (req, res) => {
  const { group_id } = req.params;
  const { userId } = req.body;
  const dbState = readDb();
  
  const group = dbState.groups.find(g => g.group_id === group_id);
  if (group) {
    group.members = group.members.filter((m: string) => m !== (userId || "user_demo_1"));
  }
  
  const user = dbState.users.find(u => u.user_id === (userId || "user_demo_1"));
  if (user) {
    user.group_id = null;
  }
  
  writeDb(dbState);
  res.json({ success: true });
});

// Get User's Group Detailed
app.get("/api/groups/mine", (req, res) => {
  const userId = req.query.userId as string || "user_demo_1";
  const dbState = readDb();
  
  const user = dbState.users.find(u => u.user_id === userId);
  const group_id = user ? user.group_id : "grp_demo_1";
  
  if (!group_id) {
    return res.json({ group: null, members_info: [] });
  }
  
  const group = dbState.groups.find(g => g.group_id === group_id);
  if (!group) {
    return res.json({ group: null, members_info: [] });
  }
  
  const members_info = dbState.users.filter(u => group.members.includes(u.user_id));
  res.json({ group, members_info });
});

// Group messages list
app.get("/api/groups/mine/messages", (req, res) => {
  const group_id = req.query.groupId as string || "grp_demo_1";
  const dbState = readDb();
  
  const filteredMessages = dbState.groupMessages.filter(m => m.group_id === group_id);
  res.json(filteredMessages);
});

// Create group message
app.post("/api/groups/mine/messages", (req, res) => {
  const { group_id, userId, userName, content } = req.body;
  const dbState = readDb();
  
  const newMessage = {
    message_id: "msg_" + Math.random().toString(36).substring(2, 10),
    group_id: group_id || "grp_demo_1",
    user_id: userId || "user_demo_1",
    user_name: userName || "Mireille Démo",
    content: content,
    created_at: new Date().toISOString()
  };
  
  dbState.groupMessages.push(newMessage);
  writeDb(dbState);
  
  res.json(newMessage);
});

// List all donors with their calculated stats
app.get("/api/donors", (req, res) => {
  const dbState = readDb();
  const enriched = SEED_DONORS.map(d => {
    const reviews = dbState.donorRatings.filter(r => r.donor_id === d.donor_id);
    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
    const avg = reviews.length > 0 ? Number((totalStars / reviews.length).toFixed(1)) : 0;
    return {
      ...d,
      avg_rating: avg,
      rating_count: reviews.length
    };
  });
  res.json(enriched);
});

// Donors ratings / reviews
app.get("/api/donors/:donor_id/reviews", (req, res) => {
  const { donor_id } = req.params;
  const dbState = readDb();
  
  const reviews = dbState.donorRatings.filter(r => r.donor_id === donor_id);
  const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
  const avg = reviews.length > 0 ? Number((totalStars / reviews.length).toFixed(1)) : 0;
  
  res.json({ reviews, avg, count: reviews.length });
});

// Post review/rate donor
app.post("/api/donors/:donor_id/rate", (req, res) => {
  const { donor_id } = req.params;
  const { userName, stars, outcome, comment } = req.body;
  const dbState = readDb();
  
  const newRating = {
    donor_id,
    user_name: userName || "Anonyme",
    stars: Number(stars),
    outcome: outcome,
    comment: comment || "",
    created_at: new Date().toISOString()
  };
  
  dbState.donorRatings.push(newRating);
  writeDb(dbState);
  res.json({ success: true, rating: newRating });
});

// Get My Funding Requests
app.get("/api/funding/mine", (req, res) => {
  const userId = req.query.userId as string || "user_demo_1";
  const dbState = readDb();
  
  const requests = dbState.fundingRequests.filter(r => r.user_id === userId);
  res.json(requests);
});

// Generate pitch via Gemini AI!
app.post("/api/funding/generate", async (req, res) => {
  const { project_name, sector, problem, solution, target_amount, beneficiaries, userId } = req.body;
  
  const prompt = `Rédige un pitch de financement en français pour un projet porté par des femmes rurales d'Afrique Centrale.
Tu dois adopter un style clair, encourageant, réaliste et très professionnel pour convaincre des bailleurs de fonds (ONG, microfinance).

DÉTAILS DU PROJET :
- Nom du projet : "${project_name}"
- Secteur d'activité : "${sector}"
- Problème local identifié : "${problem}"
- Solution proposée par le groupe : "${solution}"
- Montant de financement demandé : "${target_amount}"
- Bénéficiaires : "${beneficiaries}"

RÉDIGE LE PITCH EN UTILISANT EXACTEMENT CES SECTIONS EN MARKDOWN (Titre h2 "## ") :

## Résumé exécutif
(Raconte l'histoire du projet de manière percutante, en mentionnant le nom, le secteur, la localisation et le montant en 3-4 phrases)

## Le problème
(Mets en valeur la réalité locale difficile et les pertes subies par la communauté rurale)

## Notre solution
(Présente de manière pratique comment les fonds permettront d'acheter du matériel, d'augmenter la productivité ou la conservation)

## Bénéficiaires & impact
(Détaille le changement de vie concret pour les femmes et leurs familles)

## Plan d'utilisation des fonds
(Indique une répartition logique du budget en pourcentages réalistes sous forme de liste à puces : équipement, fonds de roulement, formation)

## Pourquoi nous soutenir
(Mets en valeur la force collective du groupe, la solidarité locale et la pérennité de l'activité commerciale)`;

  let pitchText = "";
  let aiGenerated = false;
  
  const gemini = getGemini();
  if (gemini) {
    try {
      const aiResponse = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7
        }
      });
      if (aiResponse && aiResponse.text) {
        pitchText = aiResponse.text;
        aiGenerated = true;
      }
    } catch (err) {
      console.error("Gemini API call failed, generating structural fallback:", err);
    }
  }

  // Fallback if AI fails or if API key is not configured
  if (!pitchText) {
    pitchText = `## Résumé exécutif
Le groupe maraîcher présente fièrement le projet **${project_name}** dans le secteur **${sector}**. Afin d'aider notre communauté à s'autonomiser, nous sollicitons respectueusement un financement d'un montant de **${target_amount}**.

## Le problème
Actuellement, nos membres font face à un obstacle majeur : **${problem}**. Sans solution adaptée, ces difficultés limitent nos revenus et entraînent des pertes matérielles ou agricoles significatives pour de nombreuses familles du village.

## Notre solution
Pour y remédier, notre coopérative va mettre en œuvre la solution suivante : **${solution}**. Ce projet nous permettra d'accroître de manière drastique notre capacité de production et de vente locale.

## Bénéficiaires & impact
Ce projet profitera directement à **${beneficiaries}**. Grâce à cette opportunité, les bénéficiaires augmenteront durablement leurs revenus autonomes, assurant une meilleure scolarité pour les enfants et une meilleure santé communautaire.

## Plan d'utilisation des fonds
Après concertation avec tous les membres du groupe, nous prévoyons de répartir le budget de **${target_amount}** de la façon suivante :
* **Achat d'équipements productifs solides** (60%) : Financement des machines et outils principaux.
* **Fonds de roulement initial** (25%) : Acquisition de matières premières et emballages de qualité pour démarrer.
* **Formation pratique & sécurité** (15%) : Éducation collective des membres aux techniques d'exploitation et de gestion financière.

## Pourquoi nous soutenir
Notre groupe est fondé sur des valeurs de solidarité indéfectibles, de travail partagé et d'ancrage local fort. En nous soutenant, vous investissez dans une coopérative pérenne capable de générer de l'impact social concret dès la première semaine.`;
  }

  const dbState = readDb();
  const request_id = "fund_" + Math.random().toString(36).substring(2, 10);
  
  const newRequest = {
    request_id,
    user_id: userId || "user_demo_1",
    group_id: dbState.users.find(u => u.user_id === (userId || "user_demo_1"))?.group_id || "grp_demo_1",
    project_name,
    sector,
    problem,
    solution,
    target_amount,
    beneficiaries,
    pitch: pitchText,
    ai_generated: aiGenerated,
    status: "Soumis",
    created_at: new Date().toISOString()
  };
  
  dbState.fundingRequests.push(newRequest);
  writeDb(dbState);
  
  res.json(newRequest);
});

// Submit tester feedback
app.post("/api/tester-feedback", (req, res) => {
  const { name, email, rating, comment, role } = req.body;
  const dbState = readDb();
  
  const newFeedback = {
    feedback_id: "feedback_" + Math.random().toString(36).substring(2, 10),
    name,
    email,
    rating: Number(rating),
    comment,
    role: role || "Bêta-testeuse",
    created_at: new Date().toISOString()
  };
  
  dbState.testerFeedbacks.push(newFeedback);
  writeDb(dbState);
  
  res.json({ success: true, feedback: newFeedback });
});

// List tester feedback (for Admin or special testing widget)
app.get("/api/tester-feedback", (req, res) => {
  const dbState = readDb();
  res.json(dbState.testerFeedbacks);
});


// ---------------- Vite Middleware & Ingress ----------------

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
