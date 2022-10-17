import { StatisticOptional } from './statistic.types';

export interface Word {
  id: string;
  _id?: string;
  group: number;
  page: number;
  word: string;
  image: string;
  audio: string;
  audioMeaning: string;
  audioExample: string;
  textMeaning: string;
  textExample: string;
  transcription: string;
  wordTranslate: string;
  textMeaningTranslate: string;
  textExampleTranslate: string;
}

export interface UserWord {
  difficulty: string;
  optional: {
    seria: number;
    correct: number;
    incorrect: number;
  };
}

export interface Statistic {
  learnedWords: number;
  optional: StatisticOptional;
}

export interface Setting {
  wordsPerDay: number;
}

export interface Auth {
  message: string;
  token: string;
  refreshToken: string;
  userId: string;
  name: string;
}

export interface User {
  name: string;
  email: string;
  password: string;
}

export type Refresh = Pick<Auth, 'token' | 'refreshToken'>;

export type AggregatedWord = Word & { userWord?: UserWord };

export interface AggregatedWordsInfo {
  paginatedResults: AggregatedWord[];
  totalCount: { count: number }[];
}

export interface FormPayload {
  [key: string]: string;
}
