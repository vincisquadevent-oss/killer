import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove, push, get, off } from 'firebase/database';
import type { Game, Player, Profile, HistoryEntry } from './types.ts';

// Configuration Firebase - À remplacer par vos propres valeurs
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ============================================
// FONCTIONS DE GESTION DES PARTIES
// ============================================

/**
 * Créer une nouvelle partie
 */
export async function createGame(game: Game): Promise<string> {
  const gameRef = ref(database, `games/${game.id}`);
  await set(gameRef, {
    ...game,
    createdAt: Date.now(),
    lastUpdated: Date.now()
  });
  return game.id;
}

/**
 * Rejoindre une partie existante
 */
export async function joinGame(gameId: string, player: Player): Promise<boolean> {
  const gameRef = ref(database, `games/${gameId}`);
  
  try {
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
      console.error("Partie non trouvée");
      return false;
    }

    const game = snapshot.val() as Game;
    
    // Vérifier si le joueur existe déjà
    const existingPlayer = game.players.find(p => p.id === player.id);
    if (existingPlayer) {
      console.log("Joueur déjà dans la partie");
      return true;
    }

    // Ajouter le joueur
    const updatedPlayers = [...game.players, player];
    await update(gameRef, {
      players: updatedPlayers,
      lastUpdated: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la jonction:", error);
    return false;
  }
}

/**
 * Mettre à jour une partie
 */
export async function updateGame(gameId: string, updates: Partial<Game>): Promise<void> {
  const gameRef = ref(database, `games/${gameId}`);
  await update(gameRef, {
    ...updates,
    lastUpdated: Date.now()
  });
}

/**
 * Écouter les changements d'une partie en temps réel
 */
export function subscribeToGame(gameId: string, callback: (game: Game | null) => void): () => void {
  const gameRef = ref(database, `games/${gameId}`);
  
  const unsubscribe = onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as Game);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Erreur d'écoute:", error);
    callback(null);
  });

  // Retourner la fonction de désabonnement
  return () => off(gameRef, 'value', unsubscribe);
}

/**
 * Supprimer une partie
 */
export async function deleteGame(gameId: string): Promise<void> {
  const gameRef = ref(database, `games/${gameId}`);
  await remove(gameRef);
}

/**
 * Vérifier si une partie existe
 */
export async function gameExists(gameId: string): Promise<boolean> {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  return snapshot.exists();
}

/**
 * Obtenir une partie
 */
export async function getGame(gameId: string): Promise<Game | null> {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  return snapshot.exists() ? (snapshot.val() as Game) : null;
}

// ============================================
// FONCTIONS DE GESTION DES JOUEURS
// ============================================

/**
 * Mettre à jour un joueur
 */
export async function updatePlayer(gameId: string, playerId: string, updates: Partial<Player>): Promise<void> {
  const game = await getGame(gameId);
  if (!game) return;

  const updatedPlayers = game.players.map(p => 
    p.id === playerId ? { ...p, ...updates } : p
  );

  await updateGame(gameId, { players: updatedPlayers });
}

/**
 * Supprimer un joueur
 */
export async function removePlayer(gameId: string, playerId: string): Promise<void> {
  const game = await getGame(gameId);
  if (!game) return;

  const updatedPlayers = game.players.filter(p => p.id !== playerId);
  await updateGame(gameId, { players: updatedPlayers });
}

// ============================================
// PROFILS & HISTORIQUE
// ============================================

export async function getProfile(profileId: string): Promise<Profile | null> {
  const profileRef = ref(database, `profiles/${profileId}`);
  const snapshot = await get(profileRef);
  return snapshot.exists() ? (snapshot.val() as Profile) : null;
}

export async function upsertProfile(profile: Profile): Promise<void> {
  const profileRef = ref(database, `profiles/${profile.id}`);
  await set(profileRef, profile);
}

export async function appendHistory(profileId: string, entry: HistoryEntry): Promise<void> {
  const profileRef = ref(database, `profiles/${profileId}`);
  const snapshot = await get(profileRef);
  if (!snapshot.exists()) {
    const newProfile: Profile = {
      id: profileId,
      createdAt: Date.now(),
      history: [entry],
    };
    await set(profileRef, newProfile);
    return;
  }

  const profile = snapshot.val() as Profile;
  const history = Array.isArray(profile.history) ? profile.history : [];
  const nextHistory = [entry, ...history].slice(0, 50);
  await update(profileRef, { history: nextHistory });
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Tester la connexion Firebase
 */
export async function testConnection(): Promise<boolean> {
  try {
    const testRef = ref(database, '.info/connected');
    const snapshot = await get(testRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Erreur de connexion Firebase:", error);
    return false;
  }
}

/**
 * Nettoyer les parties anciennes (> 24h)
 */
export async function cleanupOldGames(): Promise<void> {
  const gamesRef = ref(database, 'games');
  const snapshot = await get(gamesRef);
  
  if (!snapshot.exists()) return;

  const games = snapshot.val();
  const now = Date.now();
  const DAY_IN_MS = 24 * 60 * 60 * 1000;

  for (const [gameId, game] of Object.entries(games)) {
    const gameData = game as Game & { createdAt: number };
    if (now - gameData.createdAt > DAY_IN_MS) {
      await deleteGame(gameId);
      console.log(`Partie ${gameId} supprimée (trop ancienne)`);
    }
  }
}

export default database;
