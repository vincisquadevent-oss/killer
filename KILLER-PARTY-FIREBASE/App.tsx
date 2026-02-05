
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Game, Player, GameStatus, PlayerStatus, Mission, KillEvent } from './types';
import { DEFAULT_MISSIONS, AVATARS } from './constants.tsx';
import { generateMissions } from './services/geminiService';
import { 
  createGame, 
  joinGame, 
  updateGame, 
  subscribeToGame, 
  getGame
} from './firebase';

// --- Composants UI ---

const Logo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg' | 'xl', className?: string }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-24 h-24', xl: 'w-40 h-40' };
  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      <div className="absolute inset-0 bg-rose-600/30 blur-[30px] rounded-full animate-pulse"></div>
      <svg viewBox="0 0 100 100" fill="none" className="relative z-10 w-full h-full drop-shadow-[0_0_15px_rgba(225,29,72,0.6)]">
        <path d="M50 5L90 25V75L50 95L10 75V25L50 5Z" className="stroke-rose-600/20 fill-slate-950/80" strokeWidth="2" />
        <path d="M35 30V70" className="stroke-white" strokeWidth="8" strokeLinecap="round" />
        <path d="M35 50L65 30" className="stroke-white" strokeWidth="8" strokeLinecap="round" />
        <path d="M35 50L65 70" className="stroke-rose-600" strokeWidth="8" strokeLinecap="round" />
        <circle cx="65" cy="50" r="4" className="fill-rose-600 animate-pulse" />
      </svg>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false }: any) => {
  const variants = {
    primary: 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(225,29,72,0.4)] border-b-4 border-rose-800 active:border-b-0 active:translate-y-[4px]',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-b-4 border-slate-950 active:border-b-0 active:translate-y-[4px]',
    danger: 'bg-rose-900/50 hover:bg-rose-800/50 text-rose-500 border-2 border-rose-500/30 active:scale-95',
    outline: 'border-2 border-slate-800 hover:border-rose-500/50 text-slate-500 hover:text-rose-400 backdrop-blur-md',
  };
  return (
    <button disabled={disabled || loading} onClick={onClick} className={`px-6 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all disabled:opacity-20 flex items-center justify-center gap-3 ${variants[variant as keyof typeof variants]} ${className}`}>
      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : children}
    </button>
  );
};

const Card = ({ children, className = '', status = 'default', glow = false }: any) => {
  const borderColors = { default: 'border-white/5', active: 'border-rose-500/40', danger: 'border-rose-600/60' };
  return (
    <div className={`bg-gradient-to-br from-slate-900/80 to-slate-950/90 border backdrop-blur-2xl rounded-[2.5rem] p-7 transition-all duration-500 ${glow ? 'shadow-[0_0_40px_rgba(225,29,72,0.15)]' : ''} ${borderColors[status as keyof typeof borderColors]} ${className}`}>
      {children}
    </div>
  );
};

const PinKeypad = ({ value, onChange, onComplete }: { value: string, onChange: (val: string) => void, onComplete: () => void }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'];
  
  const handlePress = (key: string) => {
    if (key === 'C') onChange('');
    else if (key === '✓') onComplete();
    else if (value.length < 4) onChange(value + key);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map(k => (
        <button key={k} onClick={() => handlePress(k)} className="h-16 rounded-2xl bg-slate-900/60 border border-white/5 font-display font-bold text-xl active:bg-rose-600 active:scale-95 transition-all">
          {k}
        </button>
      ))}
    </div>
  );
};

// --- Application Principale ---

export default function App() {
  const [userPseudo, setUserPseudo] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [user, setUser] = useState<Player | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'secret' | 'feed' | 'players'>('secret');
  const [loading, setLoading] = useState(false);
  const [killLogs, setKillLogs] = useState<KillEvent[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [killConfirmModal, setKillConfirmModal] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{
    gameId: string;
    name: string;
    date: number;
    result: 'winner' | 'survived' | 'eliminated';
    kills: number;
    score: number;
  }>>([]);
  const historyRecordedRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Multiplayer states
  const [joinMode, setJoinMode] = useState<'none' | 'host' | 'join'>('none');
  const [pinCode, setPinCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const currentPlayer = useMemo(() => game?.players.find(p => p.id === user?.id) || user, [game?.players, user]);
  const currentTarget = useMemo(() => game?.players.find(p => p.id === currentPlayer?.targetId) || null, [game, currentPlayer]);
  const avatars = useMemo(() => (customAvatar ? [customAvatar, ...AVATARS] : AVATARS), [customAvatar]);

  // 🔥 FIREBASE: Lire le code de partie depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    if (joinCode && !user && !game) {
      setJoinMode('join');
      setPinCode(joinCode);
    }
  }, [user, game]);

  // 🔥 FIREBASE: Sauvegarder l'utilisateur en local (pour reconnecter)
  useEffect(() => {
    if (user) {
      localStorage.setItem('killer_user', JSON.stringify(user));
    }
    if (activeGameId) {
      localStorage.setItem('killer_game_id', activeGameId);
    }
  }, [user, activeGameId]);

  // 🔥 FIREBASE: Restaurer la session au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('killer_user');
    const savedGameId = localStorage.getItem('killer_game_id');
    const savedAvatar = localStorage.getItem('killer_custom_avatar');
    const savedHistory = localStorage.getItem('killer_history');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur de restauration:', error);
        localStorage.removeItem('killer_user');
      }
    }
    if (savedGameId) {
      setActiveGameId(savedGameId);
    }

    if (savedAvatar) {
      setCustomAvatar(savedAvatar);
      setSelectedAvatar(savedAvatar);
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        }
      } catch (error) {
        console.error('Erreur de lecture historique:', error);
      }
    }
  }, []);

  // 🔥 FIREBASE: S'abonner aux mises à jour en temps réel
  useEffect(() => {
    const gameId = activeGameId || localStorage.getItem('killer_game_id');
    if (!gameId) return;

    console.log('📡 Abonnement Firebase pour la partie:', gameId);

    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      if (updatedGame) {
        setGame(updatedGame);
        setIsConnected(true);
        setKillLogs(updatedGame.killLogs || []);
        if (!activeGameId) setActiveGameId(updatedGame.id);
        console.log('✅ Partie mise à jour depuis Firebase');
      } else {
        console.warn('⚠️ Partie non trouvée');
        setIsConnected(false);
      }
    });

    return () => {
      console.log('🔌 Désabonnement Firebase');
      unsubscribe();
    };
  }, [activeGameId]);

  // Generate QR Code
  useEffect(() => {
    if (game?.id && (window as any).QRCode) {
      (window as any).QRCode.toDataURL(`${window.location.origin}?join=${game.id}`, {
        margin: 2,
        color: { dark: '#e11d48', light: '#020617' }
      }, (err: any, url: string) => {
        if (!err) setQrCodeUrl(url);
      });
    }
  }, [game?.id]);

  // 🔥 FIREBASE: Créer une partie
  const handleCreateGame = async () => {
    if (!userPseudo.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const newPlayer: Player = { 
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, 
        name: userPseudo, 
        avatar: selectedAvatar, 
        status: PlayerStatus.ALIVE, 
        killCount: 0, 
        score: 0 
      };

      const gameId = Math.random().toString(36).substring(7).toUpperCase().slice(0, 4);
      
      const newGame: Game = {
        id: gameId,
        name: `OPS: ${userPseudo.toUpperCase()}`,
        hostId: newPlayer.id,
        status: GameStatus.LOBBY,
        players: [newPlayer],
        killLogs: [],
        config: { useAI: true, difficulty: 2, ageRange: "All", isPrivate: true }
      };

      await createGame(newGame);
      setActiveGameId(gameId);
      setGame(newGame);
      setUser(newPlayer);
      setJoinMode('none');

      console.log('✅ Partie créée:', gameId);
    } catch (err: any) {
      console.error('❌ Erreur création partie:', err);
      setError('Impossible de créer la partie. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIREBASE: Rejoindre une partie
  const handleJoinGame = async () => {
    if (!userPseudo.trim() || pinCode.length !== 4) return;
    setLoading(true);
    setError(null);

    try {
      const gameId = pinCode.toUpperCase();
      
      // Vérifier si la partie existe et est en lobby
      const existingGame = await getGame(gameId);
      if (!existingGame) {
        setError(`Partie "${gameId}" non trouvée`);
        setLoading(false);
        return;
      }
      if (existingGame.status !== GameStatus.LOBBY) {
        setError(`Partie "${gameId}" déjà lancée`);
        setLoading(false);
        return;
      }

      const newPlayer: Player = { 
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, 
        name: userPseudo, 
        avatar: selectedAvatar, 
        status: PlayerStatus.ALIVE, 
        killCount: 0, 
        score: 0 
      };

      const success = await joinGame(gameId, newPlayer);
      
      if (success) {
        setActiveGameId(gameId);
        setGame(existingGame);
        setUser(newPlayer);
        setJoinMode('none');
        console.log('✅ Rejoint la partie:', gameId);
      } else {
        setError('Impossible de rejoindre la partie');
      }
    } catch (err: any) {
      console.error('❌ Erreur jonction partie:', err);
      setError('Erreur lors de la jonction. Vérifiez le code.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIREBASE: Démarrer la saison
  const startSaison = async () => {
    if (!game || game.players.length < 2) return;
    
    setLoading(true);
    
    try {
      let missions: Mission[] = [];
      
      if (game.config.useAI) {
        try {
          const aiMissions = await generateMissions(
            game.players.length * 2,
            "Soirée entre amis",
            game.config.difficulty
          );
          missions = aiMissions.length > 0 ? aiMissions : DEFAULT_MISSIONS;
        } catch (error) {
          console.error('Erreur génération IA, utilisation des missions par défaut');
          missions = DEFAULT_MISSIONS;
        }
      } else {
        missions = DEFAULT_MISSIONS;
      }

      // Assignation circulaire des cibles
      const shuffledPlayers = [...game.players].sort(() => Math.random() - 0.5);
      const updatedPlayers = shuffledPlayers.map((player, index) => {
        const nextIndex = (index + 1) % shuffledPlayers.length;
        const missionIndex = index % missions.length;
        
        return {
          ...player,
          targetId: shuffledPlayers[nextIndex].id,
          mission: missions[missionIndex],
          status: PlayerStatus.ALIVE
        };
      });

      // 🔥 Mise à jour Firebase
      await updateGame(game.id, {
        players: updatedPlayers,
        status: GameStatus.ACTIVE,
        startTime: Date.now()
      });
      
      console.log('✅ Partie lancée sur Firebase');
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
      setError('Erreur lors du démarrage de la partie');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FIREBASE: Exécuter un kill
  const executeKill = async () => {
    if (!game || !currentPlayer || !currentTarget || currentPlayer.status !== PlayerStatus.ALIVE) return;

    const victimId = currentTarget.id;
    const victimTargetId = currentTarget.targetId;

    // Créer l'événement de kill
    const killEvent: KillEvent = {
      id: `k-${Date.now()}`,
      killerId: currentPlayer.id,
      victimId: victimId,
      timestamp: Date.now(),
      missionDesc: currentPlayer.mission?.description || ''
    };

    const updatedKillLogs = [...(game.killLogs || []), killEvent];

    // Mettre à jour les joueurs
    const updatedPlayers = game.players.map(p => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          targetId: victimTargetId,
          killCount: p.killCount + 1,
          score: p.score + (currentPlayer.mission?.difficulty || 1) * 10
        };
      }
      if (p.id === victimId) {
        return {
          ...p,
          status: PlayerStatus.ELIMINATED,
          eliminatedBy: currentPlayer.id
        };
      }
      return p;
    });

    const alivePlayers = updatedPlayers.filter(p => p.status === PlayerStatus.ALIVE);
    const newStatus = alivePlayers.length <= 1 ? GameStatus.FINISHED : GameStatus.ACTIVE;

    try {
      // 🔥 Mise à jour Firebase
      await updateGame(game.id, {
        players: updatedPlayers,
        killLogs: updatedKillLogs,
        status: newStatus
      });

      setKillLogs(updatedKillLogs);
      setKillConfirmModal(false);
      
      setSuccessOverlay(true);
      setTimeout(() => setSuccessOverlay(false), 2000);

      if (newStatus === GameStatus.FINISHED) {
        setTimeout(() => {
          alert(`🏆 VICTOIRE ! ${currentPlayer.name} remporte la partie !`);
        }, 2500);
      }

      console.log('✅ Kill synchronisé sur Firebase');
    } catch (error) {
      console.error('❌ Erreur lors du kill:', error);
      setError('Erreur lors de la confirmation du kill');
    }
  };

  const compressImage = (dataUrl: string, size = 256, quality = 0.85): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas non supporté'));

        const scale = Math.max(img.width / size, img.height / size, 1);
        const targetWidth = Math.round(img.width / scale);
        const targetHeight = Math.round(img.height / scale);

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image invalide'));
      img.src = dataUrl;
    });

  const handleAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result);
        const compressed = await compressImage(dataUrl);
        setCustomAvatar(compressed);
        setSelectedAvatar(compressed);
        localStorage.setItem('killer_custom_avatar', compressed);
      } catch (err) {
        console.error('Erreur avatar:', err);
        setError("Impossible d'utiliser cette photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const clearSession = () => {
    localStorage.removeItem('killer_user');
    localStorage.removeItem('killer_game_id');
  };

  useEffect(() => {
    if (!game || !user || game.status !== GameStatus.FINISHED) return;
    if (historyRecordedRef.current === game.id) return;

    const me = game.players.find(p => p.id === user.id);
    if (!me) return;

    const winner = [...game.players].sort((a, b) => b.score - a.score)[0];
    const result: 'winner' | 'survived' | 'eliminated' =
      me.id === winner?.id ? 'winner' : me.status === PlayerStatus.ELIMINATED ? 'eliminated' : 'survived';

    const nextHistory = [
      {
        gameId: game.id,
        name: game.name,
        date: Date.now(),
        result,
        kills: me.killCount,
        score: me.score
      },
      ...history
    ].slice(0, 20);

    setHistory(nextHistory);
    localStorage.setItem('killer_history', JSON.stringify(nextHistory));
    historyRecordedRef.current = game.id;
  }, [game, user, history]);

  // --- UI de connexion ---
  if (!user || joinMode !== 'none') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-6">
            <Logo size="xl" className="mx-auto" />
            <div>
              <h1 className="text-5xl font-black italic text-white font-display uppercase tracking-tighter leading-none">
                Killer<br/>Party
              </h1>
              <p className="text-rose-500 text-xs font-black uppercase tracking-[0.3em] mt-2">
                🔥 Firebase Edition
              </p>
            </div>
          </div>

          {error && (
            <Card status="danger" className="animate-in slide-in-from-top-4">
              <p className="text-sm text-rose-400 text-center font-bold">{error}</p>
            </Card>
          )}

          {!isConnected && (
            <Card status="danger">
              <p className="text-xs text-rose-400 text-center">⚠️ Connexion Firebase perdue</p>
            </Card>
          )}

          {joinMode === 'none' && (
            <Card className="space-y-6">
              <div className="space-y-3">
                <Button onClick={() => setJoinMode('host')} className="w-full h-16 text-base">
                  🎯 Créer une Partie
                </Button>
                <Button onClick={() => setJoinMode('join')} variant="outline" className="w-full h-16 text-base">
                  🔗 Rejoindre une Partie
                </Button>
              </div>
            </Card>
          )}

          {(joinMode === 'host' || joinMode === 'join') && (
            <Card className="space-y-6">
              <button onClick={() => { setJoinMode('none'); setError(null); }} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold">
                ← Retour
              </button>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Nom de code</label>
                <input
                  value={userPseudo}
                  onChange={(e) => setUserPseudo(e.target.value)}
                  placeholder="Agent 007"
                  className="w-full px-6 py-4 bg-slate-900/60 border-2 border-white/5 rounded-2xl text-white font-bold text-lg focus:border-rose-500/50 transition-all outline-none"
                  maxLength={20}
                />
              </div>

              {joinMode === 'join' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Code de la partie</label>
                  <div className="space-y-4">
                    <div className="flex gap-2 justify-center">
                      {pinCode.split('').concat(Array(4 - pinCode.length).fill('')).slice(0, 4).map((char, i) => (
                        <div key={i} className="w-14 h-16 bg-slate-900/60 border-2 border-white/5 rounded-xl flex items-center justify-center text-2xl font-black text-white">
                          {char || ''}
                        </div>
                      ))}
                    </div>
                    <PinKeypad value={pinCode} onChange={setPinCode} onComplete={handleJoinGame} />
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {avatars.map((avatar, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all ${
                      selectedAvatar === avatar ? 'ring-4 ring-rose-500 scale-110' : 'ring-2 ring-slate-800 opacity-50'
                    }`}
                  >
                    <img src={avatar} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarFile(file);
                    e.currentTarget.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full h-14"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📷 Utiliser la caméra
                </Button>
              </div>

              <Button 
                onClick={joinMode === 'host' ? handleCreateGame : handleJoinGame} 
                className="w-full h-16"
                disabled={!userPseudo.trim() || (joinMode === 'join' && pinCode.length !== 4)}
                loading={loading}
              >
                {joinMode === 'host' ? 'CRÉER LA PARTIE' : 'REJOINDRE'}
              </Button>

              {joinMode === 'host' && (
                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/30">
                  <p className="text-xs text-green-300 text-center">
                    ✨ Chaque joueur peut maintenant utiliser son propre téléphone !
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }

  // --- Main App UI (identique mais avec indicateur Firebase) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {successOverlay && (
        <div className="fixed inset-0 z-[200] bg-rose-600 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <Logo size="xl" className="mb-6 opacity-40 brightness-200" />
          <h2 className="text-4xl font-black italic text-white font-display uppercase tracking-tighter">MISSION ACCOMPLIE</h2>
        </div>
      )}

      <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/60 backdrop-blur-3xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">FIREBASE SYNC</h2>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-rose-500'}`}></div>
            </div>
            <div className="text-sm font-black text-rose-500 font-display">CODE: {game?.id}</div>
          </div>
        </div>
        <img src={currentPlayer?.avatar} className="w-10 h-10 rounded-xl border-2 border-rose-500/30 object-cover" alt="" />
      </header>

      <main className="flex-1 p-7 w-full max-w-xl mx-auto overflow-y-auto pb-32">
        {game?.status === GameStatus.LOBBY && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em]">🔥 Firebase Realtime</span>
              <h3 className="text-4xl font-black italic font-display">L'ASSEMBLÉE</h3>
            </div>

            {qrCodeUrl && (
              <Card className="flex flex-col items-center gap-6 py-10" glow>
                <div className="p-4 bg-white rounded-3xl relative animate-pulse-ring">
                  <img src={qrCodeUrl} className="w-40 h-40" alt="QR" />
                  <div className="absolute inset-0 border-2 border-rose-600 rounded-3xl pointer-events-none opacity-20"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanner pour rejoindre</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">CODE: {game.id}</p>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-4 gap-4">
              {game.players.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-2 animate-in zoom-in-50">
                  <img src={p.avatar} className="w-14 h-14 rounded-2xl ring-2 ring-slate-800 object-cover" alt="" />
                  <span className="text-[9px] font-black uppercase text-slate-500 truncate w-full text-center">{p.name}</span>
                </div>
              ))}
            </div>

            {game.hostId === currentPlayer?.id && (
              <Button 
                onClick={startSaison} 
                disabled={game.players.length < 2} 
                loading={loading} 
                className="w-full h-18 text-base"
              >
                🚀 LANCER L'OPÉRATION
              </Button>
            )}

            {game.hostId !== currentPlayer?.id && (
              <Card className="text-center py-8">
                <p className="text-sm text-slate-400 font-bold">En attente du lancement...</p>
                <p className="text-xs text-slate-600 mt-2">{game.players.length} joueurs connectés</p>
              </Card>
            )}
          </div>
        )}

        {game?.status === GameStatus.ACTIVE && (
          <div className="space-y-8">
            {activeTab === 'secret' && (
              <div className="space-y-6">
                {currentPlayer?.status === PlayerStatus.ALIVE ? (
                  <>
                    <button onClick={() => setIsRevealed(!isRevealed)} className="w-full">
                      <Card glow={isRevealed} status={isRevealed ? 'active' : 'default'} className="py-10 flex flex-col items-center gap-6">
                        {isRevealed ? (
                          <div className="flex items-center gap-6 animate-in zoom-in-95">
                            <img src={currentTarget?.avatar} className="w-24 h-24 rounded-2xl ring-4 ring-rose-500 object-cover" alt="" />
                            <div className="text-left">
                              <h4 className="text-4xl font-black italic text-rose-500 font-display uppercase">{currentTarget?.name}</h4>
                              <p className="text-[10px] font-black text-slate-500">CIBLE PRIORITAIRE</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2 opacity-30">
                            <div className="text-4xl">🔒</div>
                            <p className="text-[10px] font-black uppercase tracking-widest">Contrat Verrouillé</p>
                          </div>
                        )}
                      </Card>
                    </button>
                    <Card className="bg-rose-500/5 border-l-4 border-rose-500">
                      <p className="text-xl font-black leading-tight italic font-display">
                        {isRevealed ? `"${currentPlayer.mission?.description}"` : '••••••••••••••••••••••••••••'}
                      </p>
                    </Card>
                    <Button variant="primary" className="w-full h-20 text-lg" onClick={() => setKillConfirmModal(true)}>
                      ✅ CONFIRMER L'ÉLIMINATION
                    </Button>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <h3 className="text-5xl font-black italic text-rose-600 uppercase font-display">HORS JEU</h3>
                    <p className="text-slate-500 text-xs mt-2 uppercase font-black">Agent éliminé du réseau</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feed' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-black italic font-display uppercase">📊 Journal</h3>
                {killLogs.length === 0 ? (
                  <Card className="py-10 text-center opacity-50">
                    <p className="text-sm font-bold text-slate-500">Aucune élimination...</p>
                  </Card>
                ) : (
                  killLogs.slice().reverse().map(log => {
                    const killer = game.players.find(p => p.id === log.killerId);
                    const victim = game.players.find(p => p.id === log.victimId);
                    return (
                      <Card key={log.id} status="danger" className="flex items-start gap-4">
                        <div className="text-2xl">💀</div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">
                            <span className="text-rose-500">{killer?.name}</span> a éliminé{' '}
                            <span className="text-slate-400">{victim?.name}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{log.missionDesc}</p>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'players' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-black italic font-display uppercase">👥 Agents</h3>
                <Card className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img src={currentPlayer?.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Profil</p>
                      <h4 className="text-xl font-bold">{currentPlayer?.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Historique</p>
                    {history.length === 0 ? (
                      <p className="text-xs text-slate-500">Aucune partie enregistrée pour le moment.</p>
                    ) : (
                      history.slice(0, 5).map((item) => (
                        <div key={`${item.gameId}-${item.date}`} className="flex items-center justify-between text-xs">
                          <div className="text-slate-400">
                            {new Date(item.date).toLocaleDateString('fr-FR')} • {item.name}
                          </div>
                          <div className="font-bold text-slate-200">
                            {item.result === 'winner' ? '🏆 Victoire' : item.result === 'eliminated' ? '💀 Éliminé' : '🟢 Survivant'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
                {game.players.map(p => (
                  <Card key={p.id} status={p.status === PlayerStatus.ELIMINATED ? 'danger' : 'default'}>
                    <div className="flex items-center gap-4">
                      <img src={p.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{p.name}</h4>
                        <p className="text-xs text-slate-500">{p.killCount} kills • {p.score} pts</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        p.status === PlayerStatus.ALIVE ? 'bg-green-500/20 text-green-500' : 'bg-rose-500/20 text-rose-500'
                      }`}>
                        {p.status === PlayerStatus.ALIVE ? '🟢 Actif' : '💀 Éliminé'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {game?.status === GameStatus.FINISHED && (
          <div className="space-y-8 text-center py-10">
            <div className="animate-in zoom-in-50 duration-1000">
              <Logo size="xl" className="mx-auto mb-6" />
              <h2 className="text-5xl font-black italic text-rose-500 uppercase font-display mb-4">
                🏆 Partie Terminée
              </h2>
            </div>
            <Card glow className="bg-gradient-to-br from-rose-500/10 to-slate-950">
              <h3 className="text-2xl font-bold mb-6">Classement Final</h3>
              {game.players
                .sort((a, b) => b.score - a.score)
                .map((p, index) => (
                  <div key={p.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="text-2xl font-black text-rose-500 w-8">{index + 1}</div>
                    <img src={p.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div className="flex-1 text-left">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.killCount} kills</p>
                    </div>
                    <div className="text-xl font-black text-white">{p.score}</div>
                  </div>
                ))}
            </Card>
            <Button 
              onClick={() => {
                clearSession();
                window.location.reload();
              }} 
              className="w-full"
            >
              🔄 Nouvelle Partie
            </Button>
          </div>
        )}
      </main>

      {game?.status === GameStatus.ACTIVE && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 border-t border-white/5 backdrop-blur-3xl px-10 pb-10 pt-5 z-40">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <NavBtn label="Mission" icon="🕵️" active={activeTab === 'secret'} onClick={() => setActiveTab('secret')} />
            <NavBtn label="Journal" icon="📊" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
            <NavBtn label="Agents" icon="👥" active={activeTab === 'players'} onClick={() => setActiveTab('players')} />
          </div>
        </nav>
      )}

      {killConfirmModal && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-8">
          <Card className="w-full max-w-sm space-y-6 border-rose-500/50" glow>
            <h3 className="text-xl font-black italic text-rose-500 uppercase text-center">Rapport d'Exécution</h3>
            <p className="text-xs text-slate-400 text-center uppercase tracking-wider">
              Confirmez-vous avoir neutralisé l'agent <span className="text-white font-black">{currentTarget?.name}</span> ?
            </p>
            <div className="space-y-3">
              <Button onClick={executeKill} className="w-full h-14">OUI, AGENT ÉLIMINÉ</Button>
              <Button variant="outline" onClick={() => setKillConfirmModal(false)} className="w-full">NON, ANNULER</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

const NavBtn = ({ label, icon, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-rose-500' : 'text-slate-700'}`}>
    <div className={`text-xl transition-all ${active ? 'scale-125 -translate-y-2' : ''}`}>{icon}</div>
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-30'}`}>{label}</span>
  </button>
);
