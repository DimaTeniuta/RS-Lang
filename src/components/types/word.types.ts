import { UserWord } from './http.types';

export const enum WordDifficulty {
  STANDARD = 'normal',
  SOLVED = 'solved',
  HARD = 'hard',
}
export const enum GuessResult {
  NEW_WORD = 'new',
  EXISTING = 'existing',
}
export type GuessedWord = {
  result: GuessResult;
} & UserWord;
