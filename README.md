# 🌱 Éclosion by AFEP

**Éclosion** est la plateforme d'autonomisation de l'association **AFEP-3.0**, pensée pour les groupes de femmes rurales d'Afrique Centrale. Elle veut leur permettre de :

- **Se connecter** : créer ou rejoindre un groupe et échanger via une messagerie de groupe ;
- **Se former** : suivre des modules de formation consultables hors-ligne (transformation du manioc, savonnerie, couture…) ;
- **Se financer** : découvrir un annuaire de bailleurs de fonds noté par la communauté et générer des dossiers de financement assistés par IA (Gemini).

⚠️ L'application est en **version bêta, encore en construction** : elle est actuellement testée par un premier groupe de testeuses et évoluera au fil de leurs retours.

🔗 **Bêta en ligne** : https://afep-3-0.onrender.com — compte de démonstration via le bouton « Accès rapide ».

## Lancer en local

**Prérequis** : Node.js

```bash
npm install
npm run dev
```

Renseigner `GEMINI_API_KEY` dans `.env` (voir `.env.example`). Sans identifiants Turso, l'app utilise automatiquement une base SQLite locale (`eclosion.db`).

## Aux origines 💡

Ce projet est né en *vibe coding* sur [Google AI Studio](https://ai.studio/apps/c322fa44-8028-4e66-81d8-40b72f6bcb30), qui a permis de passer d'une idée à un premier prototype en quelques prompts — le point de départ de l'aventure Éclosion.
