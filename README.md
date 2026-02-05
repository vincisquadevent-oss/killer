# 🎯 Killer Party

Jeu de missions secrètes avec génération par IA pour vos soirées.

## 🚀 Déploiement sur Vercel

### 1. Uploader ces fichiers sur GitHub

Créer un nouveau repository et uploader **TOUS** les fichiers de ce dossier.

### 2. Déployer sur Vercel

1. Aller sur https://vercel.com
2. Se connecter avec GitHub
3. "Add New..." → "Project"
4. Importer votre repository
5. **⚠️ IMPORTANT** : Ajouter la variable d'environnement :
   - Dérouler "Environment Variables"
   - Name : `GEMINI_API_KEY`
   - Value : Votre clé API Gemini
6. Cliquer "Deploy"

### 3. Obtenir votre clé API Gemini

https://aistudio.google.com/apikey

## 📁 Structure du projet

```
killer-party/
├── services/
│   └── geminiService.ts     ← Service IA
├── App.tsx                   ← Application principale
├── constants.tsx             ← Missions par défaut
├── types.ts                  ← Types TypeScript
├── index.tsx                 ← Point d'entrée
├── index.html                ← HTML
├── package.json              ← Dépendances
├── tsconfig.json             ← Config TypeScript
├── vite.config.ts            ← Config Vite
├── .gitignore                ← Git ignore
└── .env.local.example        ← Template config
```

## 🎮 Utilisation

1. Créer une partie (obtenir un code)
2. Partager le code à vos amis
3. Lancer la partie
4. Accomplir vos missions secrètes !

## 💻 Développement local

```bash
npm install
cp .env.local.example .env.local
# Ajouter votre clé API dans .env.local
npm run dev
```

## 📝 Licence

MIT
