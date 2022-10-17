import { AggregatedWord, Word } from './http.types';

export interface GameWord extends Word {
  guessed: boolean;
  result: string;
}

export interface GameState {
  gameResults: GameWord[];
  words: Word[];
  notUsedWords: Word[];
}

export interface RoundState {
  currentWord: Word;
  words: Word[];
}

export enum GameResults {
  CONTINUE = 'continue',
  END = 'end',
}

export interface Metadata {
  group: number,
  page: number,
}

export interface GameContinue {
  result: GameResults.CONTINUE;
  payload: RoundState;
  wordInfo?: { guessed: boolean; result: string };
}

export interface GameEnd {
  result: GameResults.END;
  payload: GameWord[];
}
export type GameResult = GameContinue | GameEnd;

export interface SprintGameEnd {
  result: GameResults.END;
  payload: GameWord[] | undefined;
}

export interface GameStartMetadata {
  group: number;
  page: number;
}

export interface GameGenerator {
  words: Promise<AggregatedWord[]>;
  getNew: () => Promise<AggregatedWord[]>;
}

export enum ButtonRoles {
  SKIP = 'skip',
  NEXT = 'next',
  PENDING = 'pending',
  CHOICE = 'choice',
  PLAY = 'play',
  NAV_MAIN = 'navigate-main',
  NAV_BOOK = 'navigate-book'
}

export enum KeyOfKeyboard {
  KEY_1 = 'Digit1',
  KEY_2 = 'Digit2',
  KEY_3 = 'Digit3',
  KEY_4 = 'Digit4',
  KEY_5 = 'Digit5',
  SPACE = 'Space',
  ENTER = 'Enter',
  NUMPAD_ENTER = 'NumpadEnter'
}
