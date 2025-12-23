
export interface WishResponse {
  message: string;
  theme: 'romantic' | 'poetic' | 'joyful';
}

export enum GiftState {
  CLOSED = 'CLOSED',
  OPENED = 'OPENED'
}

export interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
}

export interface BurstParticle {
  x: number;
  y: number;
  color: string;
  radius: number;
  velocity: {
    x: number;
    y: number;
  };
  alpha: number;
  decay: number;
  life?: number; // For trail particles
}

export interface Point {
  x: number;
  y: number;
}

export enum ViewMode {
  HOME = 'HOME',
  TREE = 'TREE',
  GAME = 'GAME',
  UNBOXING = 'UNBOXING',
  FLAPPY_SANTA = 'FLAPPY_SANTA'
}

export interface TreeParticle {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  originalX: number;
  originalZ: number;
  yOffset: number;
  type: 'needle' | 'light' | 'bell' | 'star' | 'trunk';
  blinkSpeed?: number;
  blinkOffset?: number;
}

export interface SceneGift {
  x: number;
  y: number; // usually 0 (ground)
  z: number;
  width: number;
  height: number;
  color: string;
  ribbonColor: string;
  rotation: number; // self rotation
}

export interface LetterPosition {
  id: number;
  x: number;
  y: number;
  z: number;
  title: string;
  content: string;
  isOpen: boolean;
  projX?: number;
  projY?: number;
  projSize?: number;
}

export interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  radius: number;
  trail: {x: number, y: number}[];
}

export interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number; // Slight drift
  vy: number; // Upward velocity
  color: string;
  trail: {x: number, y: number, alpha: number}[];
}