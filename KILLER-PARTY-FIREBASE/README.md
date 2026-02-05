# 🔥 Killer Party - Firebase Edition

## Multi-joueurs en temps réel 

Version avec **Firebase Realtime Database** pour une vraie expérience multi-joueurs où chaque joueur utilise son propre appareil.

---

## ✨ Fonctionnalités

✅ **Vrai multi-joueurs** - Chacun son téléphone  
✅ **Synchronisation temps réel** - Mises à jour instantanées  
✅ **QR Code fonctionnel** - Scanner pour rejoindre  
✅ **Jusqu'à 50 joueurs** simultanés  
✅ **Missions IA** - Générées par Gemini  
✅ **Gratuit** - Jusqu'à 10 000 utilisateurs/mois

---

## 🚀 Déploiement Rapide (20 minutes)

### Prérequis

- Compte Google (pour Firebase)
- Compte Vercel (pour l'hébergement)
- Compte GitHub (pour le code)

### Étapes

1. **[Configuration Firebase](#1-configuration-firebase)** (10 min)
2. **[Upload sur GitHub](#2-upload-sur-github)** (3 min)
3. **[Configuration Vercel](#3-configuration-vercel)** (5 min)
4. **[Test](#4-test)** (2 min)

---

## 1. Configuration Firebase

### 1.1 Créer un projet Firebase

1. Aller sur https://console.firebase.google.com/
2. Cliquer **"Ajouter un projet"**
3. Nom : `killer-party` (ou autre)
4. Désactiver Google Analytics
5. Cliquer **"Créer le projet"**

### 1.2 Activer Realtime Database

1. Menu latéral → **Build** → **Realtime Database**
2. Cliquer **"Créer une base de données"**
3. Localisation : Choisir **europe-west1** (Europe) ou proche
4. Mode : Sélectionner **"Démarrer en mode test"**
5. Cliquer **"Activer"**

### 1.3 Configurer les règles de sécurité

Dans l'onglet **"Règles"** de Realtime Database, remplacer par :

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['id', 'name', 'hostId', 'status', 'players', 'config'])"
      }
    }
  }
}
```

Cliquer **"Publier"**

### 1.4 Obtenir les clés de configuration

1. Cliquer sur l'icône ⚙️ (Paramètres) → **Paramètres du projet**
2. Section **"Vos applications"** → Cliquer sur **< / >** (icône Web)
3. Surnom : `Killer Party Web`
4. NE PAS cocher Firebase Hosting
5. Cliquer **"Enregistrer l'application"**
6. **COPIER** toutes les valeurs de `firebaseConfig` :
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "killer-party-xyz.firebaseapp.com",
     databaseURL: "https://killer-party-xyz-default-rtdb.europe-west1.firebasedatabase.app",
     projectId: "killer-party-xyz",
     storageBucket: "killer-party-xyz.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

⚠️ **GARDEZ CES VALEURS** - vous en aurez besoin pour Vercel !

---

## 2. Upload sur GitHub

### 2.1 Créer un repository

1. Aller sur https://github.com/new
2. Nom : `killer-party-firebase`
3. Public ou Private (les deux fonctionnent)
4. NE PAS ajouter de README
5. Cliquer **"Create repository"**

### 2.2 Uploader les fichiers

Sur la page du repository créé :

1. Cliquer **"uploading an existing file"**
2. **Glisser-déposer TOUS les fichiers** de ce dossier :
   ```
   ✅ services/ (dossier)
   ✅ App.tsx
   ✅ firebase.ts
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
3. Message de commit : `Initial commit - Firebase version`
4. Cliquer **"Commit changes"**

### 2.3 Vérifier

Dans votre repository, vous devez voir tous les fichiers, notamment :
- 📁 `services/geminiService.ts`
- 📄 `firebase.ts`
- 📄 `App.tsx`

---

## 3. Configuration Vercel

### 3.1 Importer le projet

1. Aller sur https://vercel.com
2. Cliquer **"Add New..."** → **"Project"**
3. Sélectionner votre repository `killer-party-firebase`
4. Cliquer **"Import"**

### 3.2 Ajouter les variables d'environnement

⚠️ **ÉTAPE CRITIQUE** - Sans ces variables, l'app ne fonctionnera pas !

**AVANT de cliquer "Deploy"**, dérouler **"Environment Variables"** et ajouter :

| Name | Value |
|------|-------|
| `FIREBASE_API_KEY` | Votre `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | Votre `authDomain` |
| `FIREBASE_DATABASE_URL` | Votre `databaseURL` ⚠️ **IMPORTANT** |
| `FIREBASE_PROJECT_ID` | Votre `projectId` |
| `FIREBASE_STORAGE_BUCKET` | Votre `storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | Votre `messagingSenderId` |
| `FIREBASE_APP_ID` | Votre `appId` |
| `GEMINI_API_KEY` | Votre clé API Gemini (optionnel) |

**Pour chaque variable :**
- Entrer le Name
- Entrer le Value (depuis Firebase Console)
- Sélectionner **Production**, **Preview** ET **Development**
- Cliquer "Add"

### 3.3 Déployer

1. Vérifier que TOUTES les variables Firebase sont ajoutées
2. Cliquer **"Deploy"**
3. Attendre 1-2 minutes ⏳
4. Votre URL : `https://killer-party-firebase-xyz.vercel.app`

---

## 4. Test

### Test 1 : Ouvrir l'application

Ouvrir votre URL Vercel. Vous devriez voir :
- Logo Killer Party
- **"🔥 Firebase Edition"** sous le titre
- Boutons "Créer une Partie" et "Rejoindre une Partie"

### Test 2 : Créer une partie

1. Cliquer **"Créer une Partie"**
2. Entrer un pseudo
3. Choisir un avatar
4. Cliquer **"CRÉER LA PARTIE"**
5. **Noter le code** (ex: `XKCD`)
6. Vous devriez voir l'écran de lobby avec un **point vert** (🟢 Firebase connecté)

### Test 3 : Multi-joueurs (CRITIQUE !)

**Sur un AUTRE appareil** (téléphone d'un ami) :

1. Ouvrir la même URL Vercel
2. Cliquer **"Rejoindre une Partie"**
3. Entrer un pseudo différent
4. Entrer le code de partie (`XKCD`)
5. Cliquer **"REJOINDRE"**

**Résultat attendu :**
- Les DEUX appareils montrent maintenant 2 joueurs ✅
- Synchronisation instantanée ! 🎉
- Le point vert est allumé sur les deux appareils

✅ **Si ça fonctionne : BRAVO ! Vous avez un vrai multi-joueurs !**

---

## 🎮 Utilisation

### Créer une partie

1. L'hôte ouvre l'app sur son téléphone
2. Clique "Créer une Partie"
3. Entre son pseudo et choisit son avatar
4. Note le code de partie ou partage le QR code

### Rejoindre

**Chaque joueur :**
1. Ouvre l'app sur SON téléphone
2. Clique "Rejoindre une Partie"
3. **Option A** : Scanner le QR code
4. **Option B** : Entrer le code manuellement (4 lettres)
5. Entre son pseudo et choisit son avatar
6. Automatiquement ajouté à la partie ! ✅

### Lancer la partie

1. Quand tous les joueurs sont connectés
2. **L'hôte** clique "🚀 LANCER L'OPÉRATION"
3. Les missions sont assignées
4. **Synchronisation instantanée** sur tous les appareils

### Jouer

**Chaque joueur sur son téléphone :**
1. Appuyer sur la mission pour la révéler
2. Voir sa cible et sa mission
3. Accomplir sa mission discrètement
4. Confirmer l'élimination dans l'app
5. Recevoir une nouvelle cible automatiquement

### Fin de partie

- Détection automatique quand il reste 1 seul joueur
- Affichage du classement sur tous les appareils
- Possibilité de relancer une nouvelle partie

---

## 📊 Monitoring

### Firebase Console

Consultez les données en temps réel :

1. Firebase Console → Realtime Database → Data
2. Vous verrez : `games > {CODE_PARTIE} > players`
3. Les données se mettent à jour en direct !

### Statistiques d'usage

Firebase Spark (gratuit) inclut :
- 10 000 lectures simultanées
- 1 GB de stockage
- 10 GB de transfert/mois

**Largement suffisant pour vos soirées ! 🎉**

---

## 🆘 Dépannage

### Erreur : "Firebase not configured"

**Cause :** Variables d'environnement manquantes sur Vercel

**Solution :**
1. Vercel Dashboard → Votre projet → Settings → Environment Variables
2. Vérifier que les 7 variables `FIREBASE_*` sont présentes
3. Si manquantes, les ajouter
4. Redéployer : Deployments → ... → Redeploy

### Erreur : "Permission denied"

**Cause :** Règles Firebase trop restrictives

**Solution :**
1. Firebase Console → Realtime Database → Rules
2. Vérifier que `.read: true` et `.write: true`
3. Publier les règles

### Les joueurs ne se voient pas

**Cause :** Problème de connexion Firebase

**Solution :**
1. Vérifier le point vert dans l'app (🟢 = connecté)
2. Firebase Console → Realtime Database → Data
3. Doit afficher `games > {CODE}`
4. Si vide, vérifier `FIREBASE_DATABASE_URL` sur Vercel

### L'app ne se charge pas

**Cause :** Erreur de build

**Solution :**
1. Vercel Dashboard → Deployments → View Function Logs
2. Chercher les erreurs
3. Vérifier que tous les fichiers sont sur GitHub

### "Database URL is required"

**Cause :** Variable `FIREBASE_DATABASE_URL` manquante

**Solution :**
1. C'est LA variable la plus importante !
2. Format : `https://projet-xyz-default-rtdb.region.firebasedatabase.app`
3. L'ajouter sur Vercel
4. Redéployer

---

## 🔒 Sécurité

### Règles de production

Une fois que tout fonctionne, améliorer les règles Firebase :

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "data.exists()",
        ".write": "!data.exists() || data.child('hostId').val() === auth.uid",
        "players": {
          ".validate": "newData.hasChildren(['id', 'name', 'avatar', 'status'])"
        }
      }
    }
  }
}
```

### Protection des clés

- ✅ `.gitignore` configure pour ignorer `.env.local`
- ✅ Variables sur Vercel (non visibles publiquement)
- ✅ Règles Firebase limitent l'accès
- ⚠️ Ne jamais commiter les vraies clés sur GitHub

---

## 📝 Structure du projet

```
killer-party-firebase/
├── services/
│   └── geminiService.ts    # Service IA Gemini
├── App.tsx                  # Application principale (Firebase intégrée)
├── firebase.ts              # Configuration et fonctions Firebase
├── types.ts                 # Types TypeScript
├── constants.tsx            # Missions et avatars
├── index.tsx                # Point d'entrée React
├── index.html               # HTML de base
├── package.json             # Dépendances (Firebase inclus)
├── tsconfig.json            # Config TypeScript
├── vite.config.ts           # Config Vite
├── .gitignore               # Fichiers à ignorer
├── .env.local.example       # Template de configuration
└── README.md                # Ce fichier
```

---

## 🎉 Félicitations !

Si vous êtes arrivé ici, vous avez maintenant :

✅ Une app multi-joueurs complète  
✅ Synchronisation temps réel Firebase  
✅ Chaque joueur sur son téléphone  
✅ QR code fonctionnel  
✅ Missions IA (optionnel)  
✅ Gratuit et scalable

**Amusez-vous bien ! 🎮**

---

## 📞 Support

En cas de problème :
1. Relire la section [Dépannage](#-dépannage)
2. Vérifier les logs Vercel
3. Consulter la console Firebase
4. Vérifier que toutes les variables sont sur Vercel

---

## 📄 Licence

MIT

---

**Killer Party - Firebase Edition**  
Version 1.0.0 | Février 2026  
🔥 Multi-joueurs en temps réel
