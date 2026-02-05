
export enum GameStatus {
  LOBBY = 'LOBBY',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED'
}

export enum PlayerStatus {
  ALIVE = 'ALIVE',
  ELIMINATED = 'ELIMINATED',
  SPECTATOR = 'SPECTATOR'
}

export enum MissionCategory {
  SOCIAL = 'Social',
  PHYSICAL = 'Physical',
  CREATIVE = 'Creative',
  LOGIC = 'Logic',
  HUMOR = 'Humor',
  STEALTH = 'Stealth',
  PERFORMANCE = 'Performance'
}

export interface Mission {
  id: string;
  description: string;
  difficulty: 1 | 2 | 3;
  category: MissionCategory;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  status: PlayerStatus;
  targetId?: string;
  mission?: Mission;
  eliminatedBy?: string;
  killCount: number;
  score: number;
}

export interface Dispute {
  id: string;
  killerId: string;
  victimId: string;
  missionDesc: string;
  votes: Record<string, 'valid' | 'invalid'>;
  status: 'pending' | 'validated' | 'rejected';
}

export interface Game {
  id: string;
  name: string;
  hostId: string;
  status: GameStatus;
  players: Player[];
  killLogs?: KillEvent[];
  config: {
    useAI: boolean;
    difficulty: number;
    ageRange: string;
    isPrivate: boolean;
    mode: 'FUN' | 'FUN_CORPORATE' | 'CHILL';
  };
  dispute?: Dispute;
  startTime?: number;
}

export interface KillEvent {
  id: string;
  killerId: string;
  victimId: string;
  timestamp: number;
  missionDesc: string;
}
