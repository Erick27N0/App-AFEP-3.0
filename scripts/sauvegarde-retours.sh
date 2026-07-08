#!/usr/bin/env bash
# Sauvegarde les retours des bêta-testeuses de l'app Éclosion en ligne.
#
# Usage :   ./scripts/sauvegarde-retours.sh
# Résultat : un fichier sauvegardes/retours-AAAA-MM-JJ-HHMM.json
#
# À LANCER IMPÉRATIVEMENT AVANT CHAQUE `git push` : sur l'offre gratuite
# de Render, chaque redéploiement efface la base de données en ligne.

set -euo pipefail
cd "$(dirname "$0")/.."

APP_URL="${APP_URL:-https://afep-3-0.onrender.com}"
DOSSIER="sauvegardes"
FICHIER="$DOSSIER/retours-$(date +%F-%H%M).json"

mkdir -p "$DOSSIER"

echo "→ Connexion à $APP_URL (jusqu'à 2 min si l'app était endormie)..."

# 1. Réveil + connexion avec le compte de démonstration (recréé à chaque
#    remise à zéro de la base, donc toujours disponible).
REPONSE=$(curl -s --max-time 120 --retry 2 --retry-delay 10 \
  -X POST "$APP_URL/api/auth/session" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@eclosion.local","password":"eclosion-demo"}')

JETON=$(echo "$REPONSE" | node -e "
  let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
    try { const j=JSON.parse(d); if(!j.session_token) throw 0; console.log(j.session_token); }
    catch { console.error('Réponse inattendue du serveur : '+d.slice(0,200)); process.exit(1); }
  })")

# 2. Téléchargement des retours
echo "→ Téléchargement des retours de test..."
curl -s --max-time 60 -H "Authorization: Bearer $JETON" \
  "$APP_URL/api/tester-feedback" > "$FICHIER"

# 3. Vérification et résumé
node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$FICHIER', 'utf8'));
  if (!Array.isArray(data)) { console.error('Contenu inattendu, sauvegarde invalide.'); process.exit(1); }
  console.log('');
  console.log('✅ ' + data.length + ' retour(s) sauvegardé(s) dans $FICHIER');
  for (const f of data) {
    console.log('   • ' + f.name + ' (' + f.rating + '★) — ' + f.comment.slice(0, 60) + (f.comment.length > 60 ? '…' : ''));
  }
"

# 4. Déconnexion (invalide le jeton temporaire)
curl -s -o /dev/null --max-time 30 -H "Authorization: Bearer $JETON" \
  -X POST "$APP_URL/api/auth/logout" || true
