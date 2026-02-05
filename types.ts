
export enum PersonaMode {
  ACADEMIC = 'Academic',
  EMPATHETIC = 'Empathetic',
  NEUTRAL = 'Neutral',
  CREATIVE = 'Creative',
  PROFESSIONAL = 'Professional'
}

export interface MessageTurn {
  role: 'user' | 'kookie';
  text: string;
  timestamp: number;
  mode?: PersonaMode;
}

export interface MemoryEntry {
  key: string;
  value: string;
}

export interface AppState {
  isActive: boolean;
  isMuted: boolean;
  currentMode: PersonaMode;
  transcript: MessageTurn[];
  memories: MemoryEntry[];
}
