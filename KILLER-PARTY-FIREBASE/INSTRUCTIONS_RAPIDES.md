# ⚡ INSTRUCTIONS RAPIDES - 20 Minutes

## 🎯 De zéro au multi-joueurs en 20 minutes

---

## ✅ Checklist

### ☐ Firebase (10 min)
1. https://console.firebase.google.com/ → Nouveau projet
2. Realtime Database → Activer en mode test
3. Copier les 7 clés de configuration
4. Règles : copier-coller depuis README.md

### ☐ GitHub (3 min)
1. https://github.com/new → Nouveau repository
2. Uploader TOUS les fichiers de ce dossier
3. Commit

### ☐ Vercel (5 min)
1. https://vercel.com → Importer le projet GitHub
2. **Avant "Deploy"** : Ajouter les 7 variables Firebase
3. Deploy
4. Attendre 1-2 min

### ☐ Test (2 min)
1. Ouvrir l'URL Vercel
2. Créer une partie (appareil 1)
3. Rejoindre avec le code (appareil 2)
4. Les deux se voient ? ✅ **C'EST BON !**

---

## 📋 Variables à ajouter sur Vercel

**IMPORTANT** : Ces 7 variables sont OBLIGATOIRES

```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_DATABASE_URL          ← LA PLUS IMPORTANTE !
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID

GEMINI_API_KEY                 ← Optionnel
```

---

## 🔗 Liens directs

| Action | URL |
|--------|-----|
| Créer projet Firebase | https://console.firebase.google.com/ |
| Créer repo GitHub | https://github.com/new |
| Déployer sur Vercel | https://vercel.com |
| Obtenir clé Gemini | https://aistudio.google.com/apikey |

---

## ⚠️ Points critiques

### 1. Règles Firebase
Dans Firebase Console → Realtime Database → Rules :

```json
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

### 2. FIREBASE_DATABASE_URL
C'est LA variable la plus importante !

Format : `https://killer-party-xyz-default-rtdb.europe-west1.firebasedatabase.app`

Sans cette variable, RIEN ne fonctionne.

### 3. Tous les fichiers sur GitHub
Vérifiez que le dossier `services/` est bien uploadé avec son contenu.

---

## 🎮 Test rapide

### Appareil 1 (hôte)
```
1. Ouvrir l'app
2. "Créer une Partie"
3. Pseudo + avatar
4. Noter le code (ex: XKCD)
5. Voir le point vert 🟢 = Connecté
```

### Appareil 2 (joueur)
```
1. Ouvrir l'app
2. "Rejoindre une Partie"
3. Entrer le code (XKCD)
4. Pseudo + avatar
5. "REJOINDRE"
```

### Résultat attendu
- Sur les DEUX appareils : 2 joueurs visibles
- Synchronisation instantanée
- Point vert allumé sur les deux

✅ **Ça marche ? PARFAIT !**

---

## 🆘 Problème ?

### App ne charge pas
```
→ Vercel logs → Chercher "Firebase"
→ Vérifier les 7 variables
```

### "Permission denied"
```
→ Firebase Console → Rules
→ Vérifier .read et .write = true
```

### Joueurs ne se voient pas
```
→ Firebase Console → Realtime Database → Data
→ Doit afficher : games > {CODE}
→ Point vert éteint ? Problème de FIREBASE_DATABASE_URL
```

---

## 📊 Résultat

**Vous aurez :**
- ✅ Vrai multi-joueurs (chacun son téléphone)
- ✅ Synchronisation temps réel
- ✅ QR code fonctionnel
- ✅ Gratuit (10k utilisateurs/mois)
- ✅ Prêt pour la soirée !

---

**Temps total : 20 minutes**  
**Coût : 0€**  
**Fonctionnel : CE SOIR**

🔥 Amusez-vous bien !
