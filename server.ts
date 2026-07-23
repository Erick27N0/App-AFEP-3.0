import express from "express";
import path from "path";
import crypto from "crypto";
import { createClient, type Client } from "@libsql/client";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { SEED_DONORS } from "./src/donors_data";

dotenv.config();
// Render "Secret Files" : monté à /etc/secrets/<nom>, contient les identifiants Turso
// quand le nombre de variables d'environnement classiques est limité sur le plan utilisé.
// N'écrase jamais une variable déjà définie (dotenv ne remplace pas process.env existant).
dotenv.config({ path: "/etc/secrets/turso.env" });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ---------------- Turso / SQLite Database ----------------
// En production : TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (données persistantes).
// En développement local sans ces variables : repli sur un fichier SQLite local.
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

const db: Client = TURSO_URL
  ? createClient({ url: TURSO_URL, authToken: TURSO_TOKEN, intMode: "number" })
  : createClient({ url: `file:${path.join(process.env.DATA_DIR || process.cwd(), "eclosion.db")}`, intMode: "number" });

if (TURSO_URL) {
  console.log("[DB] Turso connecté : données persistantes.");
} else if (process.env.NODE_ENV === "production") {
  console.error(
    "[DB] ATTENTION : TURSO_DATABASE_URL absent en production — repli sur un fichier SQLite local. " +
    "Sur Render (disque éphémère), TOUTES les données seront perdues à chaque redémarrage. " +
    "Vérifiez le Secret File /etc/secrets/turso.env ou les variables d'environnement."
  );
} else {
  console.log("[DB] Mode développement : fichier SQLite local eclosion.db.");
}

async function initSchema() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      picture TEXT NOT NULL DEFAULT '',
      group_id TEXT,
      password_hash TEXT,
      password_salt TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS groups (
      group_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (group_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS group_messages (
      message_id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS donor_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      stars INTEGER NOT NULL,
      outcome TEXT NOT NULL DEFAULT '',
      comment TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS funding_requests (
      request_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      group_id TEXT,
      project_name TEXT NOT NULL DEFAULT '',
      sector TEXT NOT NULL DEFAULT '',
      problem TEXT NOT NULL DEFAULT '',
      solution TEXT NOT NULL DEFAULT '',
      target_amount TEXT NOT NULL DEFAULT '',
      beneficiaries TEXT NOT NULL DEFAULT '',
      pitch TEXT NOT NULL DEFAULT '',
      ai_generated INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Soumis',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tester_feedbacks (
      feedback_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'Bêta-testeuse',
      created_at TEXT NOT NULL
    );
  `);
}

// ---------------- Helpers ----------------
const now = () => new Date().toISOString();
const genId = (prefix: string) => prefix + "_" + crypto.randomBytes(6).toString("hex");

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// Forme publique d'un utilisateur : jamais de hash/salt vers le client.
function toPublicUser(row: any) {
  return {
    user_id: row.user_id,
    email: row.email,
    name: row.name,
    picture: row.picture,
    group_id: row.group_id
  };
}

function normalizeEmail(raw: string): string {
  const email = String(raw || "").trim().toLowerCase();
  return email.includes("@") ? email : `${email}@eclosion.local`;
}

async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await db.execute({
    sql: "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
    args: [token, userId, now()]
  });
  return token;
}

async function groupWithMembers(groupRow: any) {
  if (!groupRow) return null;
  const result = await db.execute({
    sql: "SELECT user_id FROM group_members WHERE group_id = ?",
    args: [groupRow.group_id]
  });
  const members = result.rows.map((r: any) => r.user_id);
  return { ...groupRow, members };
}

// ---------------- Seed initial data (première exécution uniquement) ----------------
async function seedIfEmpty() {
  const countResult = await db.execute("SELECT COUNT(*) AS c FROM users");
  const count = Number((countResult.rows[0] as any).c);
  if (count > 0) return;

  const t = now();
  const demoSalt = crypto.randomBytes(16).toString("hex");
  await db.execute({
    sql: "INSERT INTO users (user_id, email, name, picture, group_id, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    args: ["user_demo_1", "demo@eclosion.local", "Mireille Démo", "", "grp_demo_1", hashPassword("eclosion-demo", demoSalt), demoSalt, t]
  });

  await db.execute({
    sql: "INSERT INTO groups (group_id, name, description, location, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      "grp_demo_1",
      "Coopérative des Femmes de Bafia",
      "12 femmes courageuses spécialisées dans la production, transformation et ensachage de farine de manioc pure.",
      "Bafia, Cameroun",
      "user_demo_1",
      t
    ]
  });
  await db.execute({
    sql: "INSERT INTO groups (group_id, name, description, location, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      "grp_demo_2",
      "Association des Artisanes de Pointe-Noire",
      "Atelier collectif de couture, broderie et de teinture de pagnes traditionnels gabonais et congolais.",
      "Pointe-Noire, Congo",
      "system",
      t
    ]
  });
  await db.execute({
    sql: "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
    args: ["grp_demo_1", "user_demo_1"]
  });

  await db.execute({
    sql: "INSERT INTO group_messages (message_id, group_id, user_id, user_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      "msg_1",
      "grp_demo_1",
      "system",
      "Éclosion Assistance",
      "Bienvenue dans le salon de discussion de votre coopérative ! Échangez ici avec vos membres pour planifier vos activités et coordonner la transformation.",
      t
    ]
  });

  await db.execute({
    sql: "INSERT INTO donor_ratings (donor_id, user_name, stars, outcome, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      "d_cm_02",
      "Aïcha (Bafia)",
      5,
      "funded",
      "Le programme ACEFA a entièrement financé notre presse à manioc mécanique ! L'accompagnement sur le terrain était formidable.",
      t
    ]
  });
  await db.execute({
    sql: "INSERT INTO donor_ratings (donor_id, user_name, stars, outcome, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      "d_cm_02",
      "Marie-Louise",
      4,
      "responded",
      "Dossier exigeant mais le comité d'évaluation étudie sérieusement chaque proposition rurale.",
      t
    ]
  });
}

// ---------------- Authentication middleware ----------------
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ error: "Non authentifiée. Veuillez vous connecter." });
  }
  const result = await db.execute({
    sql: "SELECT u.* FROM sessions s JOIN users u ON u.user_id = s.user_id WHERE s.token = ?",
    args: [token]
  });
  const userRow = result.rows[0];
  if (!userRow) {
    return res.status(401).json({ error: "Session expirée. Veuillez vous reconnecter." });
  }
  (req as any).user = userRow;
  next();
}

// ---------------- Admin middleware ----------------
// Panel admin séparé du système de comptes utilisatrices (pas de rôle "admin"
// dans la table users) : protégé par un jeton dédié fixé en variable d'env,
// comparé en temps constant comme les mots de passe plus haut.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!ADMIN_TOKEN) {
    return res.status(503).json({ error: "Panel admin non configuré (ADMIN_TOKEN manquant côté serveur)." });
  }
  const provided = Buffer.from(String(req.headers["x-admin-token"] || ""));
  const expected = Buffer.from(ADMIN_TOKEN);
  const valid = provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
  if (!valid) {
    return res.status(401).json({ error: "Jeton admin invalide." });
  }
  next();
}

// ---------------- Initialize Gemini Client ----------------
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
  // db_persistent permet de vérifier depuis l'extérieur que la production
  // est bien branchée sur Turso (sinon les données partent à chaque réveil).
  res.json({ demo_mode: true, db_persistent: Boolean(TURSO_URL) });
});

// Inscription OU connexion : si l'email existe, le mot de passe doit correspondre ;
// sinon le compte est créé avec ce mot de passe.
app.post("/api/auth/session", async (req, res) => {
  const { name, email, password } = req.body || {};
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || "").trim();
  const cleanPassword = String(password || "");

  if (!cleanEmail || cleanEmail === "@eclosion.local") {
    return res.status(400).json({ error: "Veuillez saisir votre email ou identifiant." });
  }
  if (cleanPassword.length < 4) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 4 caractères." });
  }

  const existing = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [cleanEmail] });
  let userRow: any = existing.rows[0];

  if (userRow) {
    // Compte existant : vérification du mot de passe
    if (!userRow.password_hash || !verifyPassword(cleanPassword, userRow.password_salt, userRow.password_hash)) {
      return res.status(401).json({ error: "Mot de passe incorrect pour ce compte. Réessayez ou utilisez un autre identifiant." });
    }
  } else {
    // Nouveau compte
    if (!cleanName) {
      return res.status(400).json({ error: "Veuillez saisir votre nom complet." });
    }
    const salt = crypto.randomBytes(16).toString("hex");
    userRow = {
      user_id: genId("user"),
      email: cleanEmail,
      name: cleanName,
      picture: "",
      group_id: null,
      password_hash: hashPassword(cleanPassword, salt),
      password_salt: salt,
      created_at: now()
    };
    await db.execute({
      sql: "INSERT INTO users (user_id, email, name, picture, group_id, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      args: [userRow.user_id, userRow.email, userRow.name, userRow.picture, userRow.group_id, userRow.password_hash, userRow.password_salt, userRow.created_at]
    });
  }

  const token = await createSession(userRow.user_id);
  res.json({ session_token: token, user: toPublicUser(userRow) });
});

// Profil de l'utilisatrice connectée (déduit du jeton, jamais des paramètres)
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json(toPublicUser((req as any).user));
});

// Déconnexion : invalide la session côté serveur
app.post("/api/auth/logout", requireAuth, async (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
  res.json({ success: true });
});

// Accès rapide au compte d'évaluation partagé
app.post("/api/auth/demo-login", async (req, res) => {
  const result = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: ["demo@eclosion.local"] });
  const demoUser: any = result.rows[0];
  if (!demoUser) {
    return res.status(500).json({ error: "Compte de démonstration introuvable." });
  }
  const token = await createSession(demoUser.user_id);
  res.json({ session_token: token, user: toPublicUser(demoUser) });
});

// Group creation
app.post("/api/groups", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { name, description, location } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Le nom de la coopérative est obligatoire." });
  }

  const group_id = genId("grp");
  const createdAt = now();
  await db.execute({
    sql: "INSERT INTO groups (group_id, name, description, location, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [group_id, String(name).trim(), String(description || ""), String(location || ""), user.user_id, createdAt]
  });
  await db.execute({ sql: "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", args: [group_id, user.user_id] });
  await db.execute({ sql: "UPDATE users SET group_id = ? WHERE user_id = ?", args: [group_id, user.user_id] });

  const groupResult = await db.execute({ sql: "SELECT * FROM groups WHERE group_id = ?", args: [group_id] });
  res.json(await groupWithMembers(groupResult.rows[0]));
});

// List Groups
app.get("/api/groups", async (req, res) => {
  const result = await db.execute("SELECT * FROM groups ORDER BY created_at ASC");
  const groups = await Promise.all(result.rows.map(g => groupWithMembers(g)));
  res.json(groups);
});

// Join group
app.post("/api/groups/:group_id/join", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { group_id } = req.params;

  const groupResult = await db.execute({ sql: "SELECT * FROM groups WHERE group_id = ?", args: [group_id] });
  const group = groupResult.rows[0];
  if (!group) {
    return res.status(404).json({ error: "Groupe introuvable" });
  }

  await db.execute({ sql: "INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)", args: [group_id, user.user_id] });
  await db.execute({ sql: "UPDATE users SET group_id = ? WHERE user_id = ?", args: [group_id, user.user_id] });

  res.json(await groupWithMembers(group));
});

// Leave group
app.post("/api/groups/:group_id/leave", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { group_id } = req.params;

  await db.execute({ sql: "DELETE FROM group_members WHERE group_id = ? AND user_id = ?", args: [group_id, user.user_id] });
  await db.execute({ sql: "UPDATE users SET group_id = NULL WHERE user_id = ?", args: [user.user_id] });

  res.json({ success: true });
});

// Get authenticated user's group with member profiles
app.get("/api/groups/mine", requireAuth, async (req, res) => {
  const user = (req as any).user;

  if (!user.group_id) {
    return res.json({ group: null, members_info: [] });
  }

  const groupResult = await db.execute({ sql: "SELECT * FROM groups WHERE group_id = ?", args: [user.group_id] });
  const group = groupResult.rows[0];
  if (!group) {
    return res.json({ group: null, members_info: [] });
  }

  const membersResult = await db.execute({
    sql: "SELECT u.user_id, u.email, u.name, u.picture, u.group_id FROM group_members gm JOIN users u ON u.user_id = gm.user_id WHERE gm.group_id = ?",
    args: [user.group_id]
  });

  res.json({ group: await groupWithMembers(group), members_info: membersResult.rows });
});

// Group messages list (restreint au groupe de l'utilisatrice connectée)
app.get("/api/groups/mine/messages", requireAuth, async (req, res) => {
  const user = (req as any).user;
  if (!user.group_id) {
    return res.json([]);
  }
  const result = await db.execute({
    sql: "SELECT * FROM group_messages WHERE group_id = ? ORDER BY created_at ASC",
    args: [user.group_id]
  });
  res.json(result.rows);
});

// Create group message
app.post("/api/groups/mine/messages", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { content } = req.body || {};

  if (!user.group_id) {
    return res.status(400).json({ error: "Vous devez d'abord rejoindre une coopérative." });
  }
  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: "Le message est vide." });
  }

  const newMessage = {
    message_id: genId("msg"),
    group_id: user.group_id,
    user_id: user.user_id,
    user_name: user.name,
    content: String(content).trim(),
    created_at: now()
  };
  await db.execute({
    sql: "INSERT INTO group_messages (message_id, group_id, user_id, user_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [newMessage.message_id, newMessage.group_id, newMessage.user_id, newMessage.user_name, newMessage.content, newMessage.created_at]
  });

  res.json(newMessage);
});

// List all donors with their calculated stats
app.get("/api/donors", async (req, res) => {
  const statsResult = await db.execute(
    "SELECT donor_id, COUNT(*) AS rating_count, AVG(stars) AS avg_rating FROM donor_ratings GROUP BY donor_id"
  );
  const statsById = new Map(statsResult.rows.map((s: any) => [s.donor_id, s]));

  const enriched = SEED_DONORS.map(d => {
    const s: any = statsById.get(d.donor_id);
    return {
      ...d,
      avg_rating: s ? Number(Number(s.avg_rating).toFixed(1)) : 0,
      rating_count: s ? Number(s.rating_count) : 0
    };
  });
  res.json(enriched);
});

// Donors ratings / reviews
app.get("/api/donors/:donor_id/reviews", async (req, res) => {
  const { donor_id } = req.params;
  const result = await db.execute({
    sql: "SELECT user_name, stars, outcome, comment, created_at FROM donor_ratings WHERE donor_id = ? ORDER BY created_at DESC",
    args: [donor_id]
  });
  const reviews = result.rows as any[];
  const totalStars = reviews.reduce((sum, r) => sum + Number(r.stars), 0);
  const avg = reviews.length > 0 ? Number((totalStars / reviews.length).toFixed(1)) : 0;

  res.json({ reviews, avg, count: reviews.length });
});

// Post review/rate donor (signé du nom de l'utilisatrice connectée)
app.post("/api/donors/:donor_id/rate", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { donor_id } = req.params;
  const { stars, outcome, comment } = req.body || {};

  const numStars = Number(stars);
  if (!Number.isFinite(numStars) || numStars < 1 || numStars > 5) {
    return res.status(400).json({ error: "La note doit être comprise entre 1 et 5 étoiles." });
  }

  const newRating = {
    donor_id,
    user_name: user.name,
    stars: Math.round(numStars),
    outcome: String(outcome || ""),
    comment: String(comment || ""),
    created_at: now()
  };
  await db.execute({
    sql: "INSERT INTO donor_ratings (donor_id, user_name, stars, outcome, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [newRating.donor_id, newRating.user_name, newRating.stars, newRating.outcome, newRating.comment, newRating.created_at]
  });

  res.json({ success: true, rating: newRating });
});

// Get My Funding Requests
app.get("/api/funding/mine", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const result = await db.execute({
    sql: "SELECT * FROM funding_requests WHERE user_id = ? ORDER BY created_at DESC",
    args: [user.user_id]
  });
  res.json(result.rows.map((r: any) => ({ ...r, ai_generated: Boolean(r.ai_generated) })));
});

// Generate pitch via Gemini AI!
app.post("/api/funding/generate", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { project_name, sector, problem, solution, target_amount, beneficiaries } = req.body || {};

  const prompt = `Rédige un pitch de financement en français pour un projet porté par des femmes rurales d'Afrique Centrale, membres du réseau AFEP-3.0 (Association des Familles pour l'Éducation et le Progrès v3.0).
Tu dois adopter un style clair, encourageant, réaliste et très professionnel pour convaincre des bailleurs de fonds (ONG, microfinance).
Mentionne impérativement que ce projet collectif est soutenu et encadré par l'association AFEP-3.0, garantissant le suivi rigoureux et l'éthique de la coopérative.

DÉTAILS DU PROJET :
- Nom du projet : "${project_name}"
- Secteur d'activité : "${sector}"
- Problème local identifié : "${problem}"
- Solution proposée par le groupe : "${solution}"
- Montant de financement demandé : "${target_amount}"
- Bénéficiaires : "${beneficiaries}"

RÉDIGE LE PITCH EN UTILISANT EXACTEMENT CES SECTIONS EN MARKDOWN (Titre h2 "## ") :

## Résumé exécutif
(Raconte l'histoire du projet de manière percutante, en mentionnant le nom, le secteur, la localisation et le montant en 3-4 phrases, et précise qu'il s'inscrit au sein du réseau AFEP-3.0)

## Le problème
(Mets en valeur la réalité locale difficile et les pertes subies par la communauté rurale)

## Notre solution
(Présente de manière pratique comment les fonds permettront d'acheter du matériel, d'augmenter la productivité ou la conservation)

## Bénéficiaires & impact
(Détaille le changement de vie concret pour les femmes et leurs familles)

## Plan d'utilisation des fonds
(Indique une répartition logique du budget en pourcentages réalistes sous forme de liste à puces : équipement, fonds de roulement, formation)

## Pourquoi nous soutenir
(Mets en valeur la force collective du groupe soutenue par AFEP-3.0, la solidarité locale et la pérennité de l'activité commerciale)`;

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
Le groupe maraîcher présente fièrement le projet **${project_name}** dans le secteur **${sector}**. Afin d'aider notre communauté à s'autonomiser sous l'égide de l'association **AFEP-3.0**, nous sollicitons respectueusement un financement d'un montant de **${target_amount}**.

## Le problème
Actuellement, nos membres font face à un obstacle majeur : **${problem}**. Sans solution adaptée, ces difficultés limitent nos revenus et entraînent des pertes matérielles ou agricoles significatives pour de nombreuses familles du village.

## Notre solution
Pour y remédier, notre coopérative va mettre en œuvre la solution suivante : **${solution}**. Ce projet, encadré techniquement par l'association **AFEP-3.0**, nous permettra d'accroître de manière drastique notre capacité de production et de vente locale.

## Bénéficiaires & impact
Ce projet profitera directement à **${beneficiaries}**. Grâce à cette opportunité et à l'appui d'**AFEP-3.0**, les bénéficiaires augmenteront durablement leurs revenus autonomes, assurant une meilleure scolarité pour les enfants et une meilleure santé communautaire.

## Plan d'utilisation des fonds
Après concertation avec tous les membres du groupe, nous prévoyons de répartir le budget de **${target_amount}** de la façon suivante :
* **Achat d'équipements productifs solides** (60%) : Financement des machines et outils principaux.
* **Fonds de roulement initial** (25%) : Acquisition de matières premières et emballages de qualité pour démarrer.
* **Formation pratique & sécurité** (15%) : Éducation collective des membres aux techniques d'exploitation et de gestion financière animée par l'AFEP-3.0.

## Pourquoi nous soutenir
Notre groupe est fondé sur des valeurs de solidarité indéfectibles, de travail partagé et d'ancrage local fort, consolidé par le programme d'intégration d'**AFEP-3.0**. En nous soutenant, vous investissez dans une coopérative pérenne capable de générer de l'impact social concret dès la première semaine.`;
  }

  const newRequest = {
    request_id: genId("fund"),
    user_id: user.user_id,
    group_id: user.group_id || null,
    project_name: String(project_name || ""),
    sector: String(sector || ""),
    problem: String(problem || ""),
    solution: String(solution || ""),
    target_amount: String(target_amount || ""),
    beneficiaries: String(beneficiaries || ""),
    pitch: pitchText,
    ai_generated: aiGenerated,
    status: "Soumis",
    created_at: now()
  };
  await db.execute({
    sql: "INSERT INTO funding_requests (request_id, user_id, group_id, project_name, sector, problem, solution, target_amount, beneficiaries, pitch, ai_generated, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [
      newRequest.request_id,
      newRequest.user_id,
      newRequest.group_id,
      newRequest.project_name,
      newRequest.sector,
      newRequest.problem,
      newRequest.solution,
      newRequest.target_amount,
      newRequest.beneficiaries,
      newRequest.pitch,
      aiGenerated ? 1 : 0,
      newRequest.status,
      newRequest.created_at
    ]
  });

  res.json(newRequest);
});

// Submit tester feedback
app.post("/api/tester-feedback", requireAuth, async (req, res) => {
  const { name, email, rating, comment, role } = req.body || {};

  const newFeedback = {
    feedback_id: genId("feedback"),
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    rating: Number(rating) || 5,
    comment: String(comment || "").trim(),
    role: String(role || "Bêta-testeuse"),
    created_at: now()
  };
  if (!newFeedback.name || !newFeedback.comment) {
    return res.status(400).json({ error: "Le nom et le commentaire sont obligatoires." });
  }

  await db.execute({
    sql: "INSERT INTO tester_feedbacks (feedback_id, name, email, rating, comment, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [newFeedback.feedback_id, newFeedback.name, newFeedback.email, newFeedback.rating, newFeedback.comment, newFeedback.role, newFeedback.created_at]
  });

  res.json({ success: true, feedback: newFeedback });
});

// List tester feedback (réservé aux utilisatrices connectées)
app.get("/api/tester-feedback", requireAuth, async (req, res) => {
  const result = await db.execute("SELECT * FROM tester_feedbacks ORDER BY created_at DESC");
  res.json(result.rows);
});

// ---------------- Admin Endpoints ----------------
// Toutes protégées par requireAdmin (jeton ADMIN_TOKEN, header x-admin-token),
// indépendant du système de sessions utilisatrices.

// Compteurs globaux pour un premier écran de dashboard
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  const [users, groups, funding, feedback] = await Promise.all([
    db.execute("SELECT COUNT(*) AS c FROM users"),
    db.execute("SELECT COUNT(*) AS c FROM groups"),
    db.execute("SELECT COUNT(*) AS c FROM funding_requests"),
    db.execute("SELECT COUNT(*) AS c FROM tester_feedbacks")
  ]);
  res.json({
    users: Number((users.rows[0] as any).c),
    groups: Number((groups.rows[0] as any).c),
    funding_requests: Number((funding.rows[0] as any).c),
    tester_feedbacks: Number((feedback.rows[0] as any).c)
  });
});

// List all users (sans hash/salt de mot de passe), avec le nom de leur groupe
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const result = await db.execute(
    "SELECT u.user_id, u.email, u.name, u.group_id, g.name AS group_name, u.created_at " +
    "FROM users u LEFT JOIN groups g ON g.group_id = u.group_id ORDER BY u.created_at DESC"
  );
  res.json(result.rows);
});

// Delete a user account (sessions + rattachement de groupe nettoyés)
app.delete("/api/admin/users/:user_id", requireAdmin, async (req, res) => {
  const { user_id } = req.params;
  const result = await db.batch([
    { sql: "DELETE FROM users WHERE user_id = ?", args: [user_id] },
    { sql: "DELETE FROM sessions WHERE user_id = ?", args: [user_id] },
    { sql: "DELETE FROM group_members WHERE user_id = ?", args: [user_id] }
  ], "write");
  if (result[0].rowsAffected === 0) {
    return res.status(404).json({ error: "Utilisatrice introuvable." });
  }
  res.json({ success: true });
});

// List all groups with their members (nom/email, pas juste les user_id)
app.get("/api/admin/groups", requireAdmin, async (req, res) => {
  const result = await db.execute("SELECT * FROM groups ORDER BY created_at DESC");
  const groups = await Promise.all(result.rows.map(async (g: any) => {
    const membersResult = await db.execute({
      sql: "SELECT u.user_id, u.name, u.email FROM group_members gm JOIN users u ON u.user_id = gm.user_id WHERE gm.group_id = ?",
      args: [g.group_id]
    });
    return { ...g, members: membersResult.rows };
  }));
  res.json(groups);
});

// Delete a group (mêmes 4 opérations que scripts/supprimer-groupe.sh)
app.delete("/api/admin/groups/:group_id", requireAdmin, async (req, res) => {
  const { group_id } = req.params;
  const result = await db.batch([
    { sql: "DELETE FROM groups WHERE group_id = ?", args: [group_id] },
    { sql: "DELETE FROM group_members WHERE group_id = ?", args: [group_id] },
    { sql: "DELETE FROM group_messages WHERE group_id = ?", args: [group_id] },
    { sql: "UPDATE users SET group_id = NULL WHERE group_id = ?", args: [group_id] }
  ], "write");
  if (result[0].rowsAffected === 0) {
    return res.status(404).json({ error: "Groupe introuvable." });
  }
  res.json({ success: true });
});

// List all funding requests (tous groupes/utilisatrices confondus)
app.get("/api/admin/funding-requests", requireAdmin, async (req, res) => {
  const result = await db.execute(
    "SELECT f.*, u.name AS user_name, u.email AS user_email FROM funding_requests f " +
    "JOIN users u ON u.user_id = f.user_id ORDER BY f.created_at DESC"
  );
  res.json(result.rows.map((r: any) => ({ ...r, ai_generated: Boolean(r.ai_generated) })));
});

// Update a funding request's status (suivi du dossier par l'équipe AFEP-3.0)
const FUNDING_STATUSES = ["Soumis", "En cours", "Accepté", "Refusé"];
app.patch("/api/admin/funding-requests/:request_id", requireAdmin, async (req, res) => {
  const { request_id } = req.params;
  const { status } = req.body || {};
  if (!FUNDING_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs autorisées : ${FUNDING_STATUSES.join(", ")}` });
  }
  const result = await db.execute({
    sql: "UPDATE funding_requests SET status = ? WHERE request_id = ?",
    args: [status, request_id]
  });
  if (result.rowsAffected === 0) {
    return res.status(404).json({ error: "Dossier introuvable." });
  }
  res.json({ success: true });
});

// Delete a tester feedback entry (modération)
app.delete("/api/admin/tester-feedback/:feedback_id", requireAdmin, async (req, res) => {
  const { feedback_id } = req.params;
  const result = await db.execute({
    sql: "DELETE FROM tester_feedbacks WHERE feedback_id = ?",
    args: [feedback_id]
  });
  if (result.rowsAffected === 0) {
    return res.status(404).json({ error: "Retour introuvable." });
  }
  res.json({ success: true });
});

// ---------------- Vite Middleware & Ingress ----------------

const startServer = async () => {
  await initSchema();
  await seedIfEmpty();

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
