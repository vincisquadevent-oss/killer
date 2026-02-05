# 📤 COMMENT UPLOADER SUR GITHUB

## ✅ Fichiers à uploader

Vous devez uploader **TOUS** ces fichiers/dossiers :

```
✅ services/               (DOSSIER avec geminiService.ts dedans)
✅ App.tsx
✅ constants.tsx
✅ types.ts
✅ index.tsx
✅ index.html
✅ package.json
✅ tsconfig.json
✅ vite.config.ts
✅ .gitignore
✅ .env.local.example
✅ README.md
```

## 📝 ÉTAPES

### 1. Créer un repository GitHub

1. Aller sur https://github.com/new
2. Repository name : `killer-party`
3. Description : "Jeu de missions secrètes"
4. Public ou Private (les deux fonctionnent)
5. **Ne pas** cocher "Add a README file"
6. Cliquer "Create repository"

### 2. Uploader les fichiers

**Sur la page du repository créé :**

1. Cliquer "uploading an existing file"
2. **Glisser-déposer TOUS les fichiers** de ce dossier
   - ⚠️ IMPORTANT : Inclure le dossier `services/` avec son contenu
3. En bas, message de commit : "Initial commit"
4. Cliquer "Commit changes"

### 3. Vérifier

**Dans votre repository GitHub, vous devez voir :**

```
killer-party/
├── 📁 services           ← Ce dossier doit être visible
├── 📄 App.tsx
├── 📄 constants.tsx
├── 📄 types.ts
├── 📄 index.tsx
├── 📄 index.html
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 .gitignore
├── 📄 .env.local.example
└── 📄 README.md
```

### 4. Déployer sur Vercel

Une fois que tout est sur GitHub :

1. https://vercel.com
2. "Add New..." → "Project"
3. Importer `killer-party`
4. **Ajouter** `GEMINI_API_KEY` dans Environment Variables
5. Cliquer "Deploy"

## ⚠️ POINTS IMPORTANTS

### Le dossier services/ doit être uploadé !

Sans le dossier `services/` contenant `geminiService.ts`, le build échouera avec l'erreur :

```
Error: Cannot find module './services/geminiService'
```

### Comment uploader un dossier sur GitHub ?

**Option 1 : Glisser-déposer**
- Sélectionner le dossier `services/` ET tous les fichiers
- Les glisser ensemble dans GitHub

**Option 2 : Uploader le contenu du dossier**
- Dans GitHub, cliquer "Add file" → "Create new file"
- Dans le nom, taper : `services/geminiService.ts`
- GitHub créera automatiquement le dossier
- Coller le contenu de geminiService.ts
- Commit

## 🆘 En cas de problème

### Le dossier services/ n'apparaît pas

→ Recommencer l'upload en incluant le dossier

### Build échoue sur Vercel

→ Vérifier que le dossier `services/` est bien dans le repository

### Les accents sont bizarres

→ Utiliser le fichier `constants.tsx` fourni tel quel

## ✅ CHECKLIST

Avant de déployer sur Vercel :

- [ ] Tous les fichiers sont sur GitHub
- [ ] Le dossier `services/` est visible dans le repository
- [ ] Le fichier `services/geminiService.ts` est présent
- [ ] Tous les autres fichiers sont présents
- [ ] Vous avez votre clé API Gemini

**C'est bon ? Passez au déploiement Vercel ! 🚀**
