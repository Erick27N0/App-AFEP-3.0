#!/usr/bin/env bash
# Supprime proprement un groupe de la base Turso (les 4 tables concernées).
#
# Usage :   ./scripts/supprimer-groupe.sh <group_id>
# Exemple : ./scripts/supprimer-groupe.sh grp_3c3e79160ed7
#
# Astuce : lancer sans argument affiche la liste des groupes existants.
# Les identifiants Turso sont lus dans le fichier .env local (jamais commité).

set -euo pipefail
cd "$(dirname "$0")/.."

GROUP_ID="${1:-}"

# Sans argument : afficher l'annuaire pour retrouver le group_id.
if [ -z "$GROUP_ID" ]; then
  echo "Usage : ./scripts/supprimer-groupe.sh <group_id>"
  echo ""
  echo "Groupes actuellement en base :"
  node -e "
    require('dotenv').config();
    const { createClient } = require('@libsql/client');
    const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    (async () => {
      const g = await db.execute('SELECT group_id, name, location, created_at FROM groups ORDER BY created_at');
      for (const r of g.rows) console.log('  • ' + r.group_id + '  ' + r.name + ' (' + r.location + ') — créé le ' + r.created_at.slice(0, 10));
    })();
  "
  exit 1
fi

# 1. Vérifier que le groupe existe et montrer ce qui sera supprimé.
node -e "
  require('dotenv').config();
  const { createClient } = require('@libsql/client');
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  (async () => {
    const id = '$GROUP_ID';
    const g = await db.execute({ sql: 'SELECT * FROM groups WHERE group_id = ?', args: [id] });
    if (g.rows.length === 0) { console.error('❌ Aucun groupe avec l\'identifiant ' + id); process.exit(1); }
    const membres = await db.execute({ sql: 'SELECT COUNT(*) c FROM group_members WHERE group_id = ?', args: [id] });
    const messages = await db.execute({ sql: 'SELECT COUNT(*) c FROM group_messages WHERE group_id = ?', args: [id] });
    console.log('Groupe à supprimer :');
    console.log('  Nom        : ' + g.rows[0].name);
    console.log('  Lieu       : ' + g.rows[0].location);
    console.log('  Créé le    : ' + g.rows[0].created_at);
    console.log('  Membres    : ' + membres.rows[0].c + ' (seront détachés du groupe)');
    console.log('  Messages   : ' + messages.rows[0].c + ' (seront effacés)');
    if (id === 'grp_demo_1' || id === 'grp_demo_2') {
      console.log('');
      console.log('⚠️  ATTENTION : ceci est un groupe de DÉMONSTRATION. Il ne sera pas');
      console.log('    recréé automatiquement tant que des comptes existent en base.');
    }
  })();
"

echo ""
read -r -p "Confirmer la suppression définitive ? (tapez oui) " REPONSE
if [ "$REPONSE" != "oui" ]; then
  echo "Suppression annulée, rien n'a été modifié."
  exit 0
fi

# 2. Suppression dans les 4 tables (groupe, membres, messages, rattachement des comptes).
node -e "
  require('dotenv').config();
  const { createClient } = require('@libsql/client');
  const db = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  (async () => {
    const id = '$GROUP_ID';
    await db.batch([
      { sql: 'DELETE FROM groups WHERE group_id = ?', args: [id] },
      { sql: 'DELETE FROM group_members WHERE group_id = ?', args: [id] },
      { sql: 'DELETE FROM group_messages WHERE group_id = ?', args: [id] },
      { sql: 'UPDATE users SET group_id = NULL WHERE group_id = ?', args: [id] }
    ], 'write');
    console.log('✅ Groupe ' + id + ' supprimé. Visible dans l\'app d\'ici ~8 secondes.');
  })();
"
