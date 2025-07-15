
export enum CellState {
  Empty = 'empty',
  Ship = 'ship',
  Miss = 'miss',
  Hit = 'hit',
  Sunk = 'sunk',
}

export type Grid = CellState[][];

export interface Ship {
  name: string;
  size: number;
  color: string;
}

export interface PlacedShip extends Ship {
  positions: { row: number; col: number }[];
  sunk: boolean;
}

export enum GamePhase {
  Setup = 'setup',
  Playing = 'playing',
  GameOver = 'gameOver',
}

export enum GameMode {
  PvP = 'pvp',
  PvAI = 'pvai',
  None = 'none',
}

export type Player = 'player1' | 'player2';

export type Orientation = 'horizontal' | 'vertical';
