export interface GameStatisticMetadata {
  type: StatisticTypes.SPRINT | StatisticTypes.AUDIOCALL;
  newWords: number;
  words: number;
  accuracy: number;
  seria: number;
}

export const enum StatisticTypes {
  SPRINT = 'sprint',
  AUDIOCALL = 'audioCall',
  WORDS = 'words',
}

export interface GameStatistic {
  newWords: number;
  accuracy: number;
  maxSeria: number;
  words: number;
}
export interface WordStatistic {
  newWords: number;
  learnedWords: number;
  accuracy: number;
  words: number;
}
export type StatisticOptional = Record<'time', number>
& Record<StatisticTypes.WORDS, WordStatistic>
& Record<StatisticTypes.AUDIOCALL | StatisticTypes.SPRINT, GameStatistic>
& Record<'alltime', string>;

export interface DayStat {
  time: number;
  new: number;
  learned: number;
}

export const initialStatistics: StatisticOptional = {
  time: Date.now(),
  words: {
    newWords: 0,
    learnedWords: 0,
    accuracy: 0,
    words: 0,
  },
  sprint: {
    newWords: 0,
    accuracy: 0,
    words: 0,
    maxSeria: 0,
  },
  audioCall: {
    newWords: 0,
    accuracy: 0,
    words: 0,
    maxSeria: 0,
  },
  alltime: JSON.stringify([]),
};

export interface ChartsValue {
  data: string[];
  learntWords: number[];
  newWords: number[];
}
