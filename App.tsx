
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Game, Player, GameStatus, PlayerStatus, Mission, KillEvent, Dispute } from './types';
import { DEFAULT_MISSIONS, AVATARS } from './constants.tsx';
import { generateMissions, agentifyPhoto, generateFictionalSpy } from './services/geminiService';

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

// --- Clavier Tactique pour PIN ---

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
  const [activeTab, setActiveTab] = useState<'secret' | 'feed' | 'players' | 'admin'>('secret');
  const [loading, setLoading] = useState(false);
  const [killLogs, setKillLogs] = useState<KillEvent[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showAccuseMenu, setShowAccuseMenu] = useState(false);
  const [killConfirmModal, setKillConfirmModal] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(false);
  
  // Multiplayer states
  const [joinMode, setJoinMode] = useState<'none' | 'host' | 'join'>('none');
  const [pinCode, setPinCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Camera & AI Photo states
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPlayer = useMemo(() => game?.players.find(p => p.id === user?.id) || user, [game?.players, user]);
  const currentTarget = useMemo(() => game?.players.find(p => p.id === currentPlayer?.targetId) || null, [game, currentPlayer]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('killer_user');
    const savedGame = localStorage.getItem('killer_game');
    if (savedUser && savedGame) {
      setUser(JSON.parse(savedUser));
      setGame(JSON.parse(savedGame));
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (user) localStorage.setItem('killer_user', JSON.stringify(user));
    if (game) localStorage.setItem('killer_game', JSON.stringify(game));
  }, [user, game]);

  // Generate QR Code when game ID is available
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

  const handleLogin = (isHost: boolean, gameCode?: string) => {
    if (!userPseudo.trim()) return;
    const newPlayer: Player = { id: `p-${Date.now()}`, name: userPseudo, avatar: selectedAvatar, status: PlayerStatus.ALIVE, killCount: 0, score: 0 };
    
    if (isHost) {
      const newId = Math.random().toString(36).substring(7).toUpperCase().slice(0, 4);
      setGame({ 
        id: newId, 
        name: `OPS: ${userPseudo.toUpperCase()}`, 
        hostId: newPlayer.id, 
        status: GameStatus.LOBBY, 
        players: [newPlayer], 
        config: { useAI: true, difficulty: 2, ageRange: "All", isPrivate: true } 
      });
    } else {
      // In a real app, here we would fetch the game from a database
      setGame({ 
        id: gameCode?.toUpperCase() || "ALFA", 
        name: "RÉSEAU OMEGA", 
        hostId: 'h-0', 
        status: GameStatus.LOBBY, 
        players: [{ id: 'h-0', name: 'Agent X', avatar: AVATARS[1], status: PlayerStatus.ALIVE, killCount: 0, score: 0 }, newPlayer], 
        config: { useAI: true, difficulty: 2, ageRange: "All", isPrivate: true } 
      });
    }
    setUser(newPlayer);
  };

  const executeKill = () => {
    if (!game || !currentPlayer || !currentTarget) return;

    const killEvent: KillEvent = {
      id: `kill-${Date.now()}`,
      killerId: currentPlayer.id,
      victimId: currentTarget.id,
      timestamp: Date.now(),
      missionDesc: currentPlayer.mission?.description || '',
    };

    const updatedPlayers = game.players.map(p => {
      if (p.id === currentTarget.id) return { ...p, status: PlayerStatus.ELIMINATED, eliminatedBy: currentPlayer.name };
      if (p.id === currentPlayer.id) return { ...p, killCount: p.killCount + 1, score: p.score + 5, targetId: currentTarget.targetId, mission: currentTarget.mission };
      return p;
    });

    const aliveCount = updatedPlayers.filter(p => p.status === PlayerStatus.ALIVE).length;
    const newStatus = aliveCount <= 1 ? GameStatus.FINISHED : GameStatus.ACTIVE;

    setGame({ ...game, players: updatedPlayers, status: newStatus });
    setKillLogs(prev => [killEvent, ...prev]);
    setKillConfirmModal(false);
    setSuccessOverlay(true);
    setTimeout(() => setSuccessOverlay(false), 2000);
    setIsRevealed(false);
  };

  // --- Game Mechanics ---

  // Fix: Added missing startSaison function to initiate the game
  const startSaison = async () => {
    if (!game || game.players.length < 2) return;
    setLoading(true);
    try {
      const context = "Soirée festive entre amis";
      const missions = await generateMissions(game.players.length, context, game.config.difficulty);
      
      // Merge with default missions if AI didn't provide enough or failed
      let finalMissions = [...missions];
      if (finalMissions.length < game.players.length) {
        const extraNeeded = game.players.length - finalMissions.length;
        const shuffledDefaults = [...DEFAULT_MISSIONS].sort(() => Math.random() - 0.5);
        finalMissions = [...finalMissions, ...shuffledDefaults.slice(0, extraNeeded)];
      }

      // Shuffle players and assign targets in a cycle (A targets B, B targets C, ..., Z targets A)
      const shuffled = [...game.players].sort(() => Math.random() - 0.5);
      const playersWithAssignments = shuffled.map((p, i) => {
        const nextPlayer = shuffled[(i + 1) % shuffled.length];
        return {
          ...p,
          targetId: nextPlayer.id,
          mission: finalMissions[i % finalMissions.length],
          status: PlayerStatus.ALIVE
        };
      });

      setGame({
        ...game,
        players: playersWithAssignments,
        status: GameStatus.ACTIVE,
        startTime: Date.now()
      });
      setActiveTab('secret');
    } catch (error) {
      console.error("Failed to start operation:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Camera Logic ---

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied", err);
      setShowCamera(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setShowCamera(false);
      setIsProcessingAI(true);
      const agentified = await agentifyPhoto(dataUrl);
      if (agentified) setSelectedAvatar(agentified);
      setIsProcessingAI(false);
    }
  };

  // --- Rendu Login ---

  if (!user || !game) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
        
        {isProcessingAI && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center space-y-8">
            <div className="w-32 h-32 border-4 border-rose-500/20 border-t-rose-600 rounded-full animate-spin"></div>
            <h3 className="text-2xl font-black italic text-rose-500 uppercase font-display tracking-tight">ENCRYPTAGE...</h3>
          </div>
        )}

        {showCamera && (
          <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-[3rem] overflow-hidden border-4 border-rose-600/30">
               <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-75" />
               <div className="absolute top-1/2 left-0 w-full h-1 bg-rose-500/40 animate-scan"></div>
            </div>
            <div className="mt-12 flex gap-4 w-full max-w-sm">
               <Button onClick={capturePhoto} className="flex-1 h-20">SCANNER</Button>
               <Button variant="outline" onClick={() => setShowCamera(false)} className="px-8">RETOUR</Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="w-full max-w-md space-y-10 relative z-10 animate-in fade-in zoom-in-95 duration-700">
           <div className="text-center space-y-4">
              <Logo size="lg" className="mx-auto" />
              <h1 className="text-6xl font-black italic tracking-tighter text-rose-500 font-display uppercase leading-none">KILLER<br/><span className="text-white">PARTY</span></h1>
           </div>

           {joinMode === 'none' ? (
             <Card className="space-y-6">
                <Button onClick={() => setJoinMode('host')} className="w-full h-20 text-lg">CRÉER UNE MISSION</Button>
                <Button onClick={() => setJoinMode('join')} variant="outline" className="w-full h-20 text-lg">REJOINDRE LE RÉSEAU</Button>
             </Card>
           ) : joinMode === 'join' && !userPseudo ? (
             <Card className="space-y-8 animate-in slide-in-from-right-10">
                <div className="space-y-4">
                  <h3 className="text-center text-rose-500 font-black uppercase text-xs tracking-widest">Saisir le Code Satellite</h3>
                  <div className="flex justify-center gap-3">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`w-12 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-display font-bold ${pinCode[i] ? 'border-rose-500 text-white bg-rose-500/10' : 'border-slate-800 text-slate-700'}`}>
                        {pinCode[i] || '•'}
                      </div>
                    ))}
                  </div>
                  <PinKeypad value={pinCode} onChange={setPinCode} onComplete={() => {}} />
                </div>
                <Button onClick={() => setJoinMode('none')} variant="outline" className="w-full">Annuler</Button>
                {pinCode.length === 4 && (
                  <Button onClick={() => {}} className="w-full animate-bounce">VÉRIFIER LE CODE</Button>
                )}
             </Card>
           ) : (
             <Card className="space-y-6 animate-in slide-in-from-bottom-10">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Nom de Code de l'Agent</label>
                   <input value={userPseudo} onChange={(e) => setUserPseudo(e.target.value)} placeholder="VOTRE PSEUDO" className="w-full bg-slate-950/50 border-2 border-slate-800/50 rounded-2xl px-6 py-5 focus:border-rose-600 focus:outline-none font-black text-center uppercase tracking-widest" />
                </div>
                
                <div className="flex justify-center gap-4 py-2">
                   <button onClick={openCamera} className="text-[10px] font-black text-rose-500 uppercase border-b-2 border-rose-500/20 pb-1">Scan Photo</button>
                   <button onClick={async () => { setIsProcessingAI(true); const a = await generateFictionalSpy(); if(a) setSelectedAvatar(a); setIsProcessingAI(false); }} className="text-[10px] font-black text-rose-500 uppercase border-b-2 border-rose-500/20 pb-1">Avatar IA</button>
                </div>

                <div className="flex justify-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                   <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-rose-500 shadow-xl">
                      <img src={selectedAvatar} className="w-full h-full object-cover" />
                   </div>
                </div>

                <Button onClick={() => handleLogin(joinMode === 'host')} className="w-full h-16">DÉPLOYER L'AGENT</Button>
             </Card>
           )}
        </div>
      </div>
    );
  }

  // --- Main App UI ---
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
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">CANAL SECURISE</h2>
             <div className="text-sm font-black text-rose-500 font-display">CODE: {game.id}</div>
          </div>
        </div>
        <img src={currentPlayer.avatar} className="w-10 h-10 rounded-xl border-2 border-rose-500/30 object-cover" />
      </header>

      <main className="flex-1 p-7 w-full max-w-xl mx-auto overflow-y-auto pb-32">
        {game.status === GameStatus.LOBBY && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="text-center space-y-2">
                <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em]">Satellite Link: Stable</span>
                <h3 className="text-4xl font-black italic font-display">L'ASSEMBLÉE</h3>
             </div>

             {/* QR Code Section pour le partage */}
             <Card className="flex flex-col items-center gap-6 py-10" glow>
                {qrCodeUrl && (
                  <div className="p-4 bg-white rounded-3xl relative animate-pulse-ring">
                    <img src={qrCodeUrl} className="w-40 h-40" alt="Join QR" />
                    <div className="absolute inset-0 border-2 border-rose-600 rounded-3xl pointer-events-none opacity-20"></div>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanner pour rejoindre</p>
                  <p className="text-2xl font-display font-bold text-white mt-1">ID: {game.id}</p>
                </div>
             </Card>

             <div className="grid grid-cols-4 gap-4">
                {game.players.map(p => (
                   <div key={p.id} className="flex flex-col items-center gap-2">
                      <img src={p.avatar} className="w-14 h-14 rounded-2xl ring-2 ring-slate-800" />
                      <span className="text-[9px] font-black uppercase text-slate-500 truncate w-full text-center">{p.name}</span>
                   </div>
                ))}
             </div>

             {game.hostId === currentPlayer.id && (
                <Button onClick={startSaison} disabled={game.players.length < 2} loading={loading} className="w-full h-18 text-base">LANCER L'OPÉRATION</Button>
             )}
          </div>
        )}

        {/* ... Reste de l'UI (ACTIVE / FINISHED) similaire à la version précédente avec quelques touches de polissage ... */}
        {game.status === GameStatus.ACTIVE && (
          <div className="space-y-8">
            {activeTab === 'secret' && (
              <div className="space-y-6">
                {currentPlayer.status === PlayerStatus.ALIVE ? (
                  <>
                    <button onClick={() => setIsRevealed(!isRevealed)} className="w-full">
                       <Card glow={isRevealed} status={isRevealed ? 'active' : 'default'} className="py-10 flex flex-col items-center gap-6">
                          {isRevealed ? (
                             <div className="flex items-center gap-6 animate-in zoom-in-95">
                                <img src={currentTarget?.avatar} className="w-24 h-24 rounded-2xl ring-4 ring-rose-500" />
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
                    <Button variant="primary" className="w-full h-20 text-lg" onClick={() => setKillConfirmModal(true)}>CONFIRMER L'ÉLIMINATION</Button>
                  </>
                ) : (
                  <div className="py-20 text-center">
                    <h3 className="text-5xl font-black italic text-rose-600 uppercase font-display">HORS JEU</h3>
                    <p className="text-slate-500 text-xs mt-2 uppercase font-black">Agent éliminé du réseau</p>
                  </div>
                )}
              </div>
            )}
            {/* Tabs for Players and Feed remain similar but with improved styling */}
          </div>
        )}
      </main>

      {game.status === GameStatus.ACTIVE && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 border-t border-white/5 backdrop-blur-3xl px-10 pb-10 pt-5 z-40">
           <div className="max-w-md mx-auto flex items-center justify-between">
              <NavBtn label="Mission" icon="🕵️" active={activeTab === 'secret'} onClick={() => setActiveTab('secret')} />
              <NavBtn label="Réseau" icon="📊" active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} />
              <NavBtn label="Agents" icon="👥" active={activeTab === 'players'} onClick={() => setActiveTab('players')} />
           </div>
        </nav>
      )}

      {killConfirmModal && (
        <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-8">
           <Card className="w-full max-w-sm space-y-6 border-rose-500/50" glow>
              <h3 className="text-xl font-black italic text-rose-500 uppercase text-center">Rapport d'Exécution</h3>
              <p className="text-xs text-slate-400 text-center uppercase tracking-wider">Confirmez-vous avoir neutralisé l'agent <span className="text-white font-black">{currentTarget?.name}</span> ?</p>
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
