import statisticController from '../statistics/statistic.controller';
import {
  GameContinue,
  GameEnd,
  GameResult,
  GameResults,
  GameState,
  GameWord,
  RoundState,
  SprintGameEnd,
} from '../types/game.types';
import { Word } from '../types/http.types';
import { GameStatisticMetadata, StatisticTypes } from '../types/statistic.types';
import wordController from '../words/word.controller';
import localStorageModule from '../localStorage/localStorage';
import gameController from '../game/game.controller';
import { NUMBER_FOR_CORRECT_REQUEST } from '../variables/general.variables';

export default class SprintController {
  gameState: GameState | undefined;
  roundState: RoundState | undefined;
  score = 0;
  scoreMultiply = 10;
  maxSeria = 0;
  seria = 0;
  generator!: { words: Promise<Word[]>; getNew: () => Promise<Word[]> };
  page = 0;
  isLocked = false;

  async startGame(level: number, startFromBookPage: boolean): Promise<GameContinue | undefined> {
    this.maxSeria = 0;
    this.seria = 0;
    this.score = 0;
    this.scoreMultiply = 10;
    this.isLocked = false;
    this.page = <number>localStorageModule.get('page');
    const words = startFromBookPage
      ? await gameController.getInfiniteFromPage(level - NUMBER_FOR_CORRECT_REQUEST, this.page)
      : await gameController.getInfiniteByGroup(level - NUMBER_FOR_CORRECT_REQUEST);
    this.generator = words;
    this.gameState = {
      gameResults: [],
      words: [...(await words.words)],
      notUsedWords: [...(await words.words)],
    };
    const round = this.generateRound();

    if (round && round.result === GameResults.CONTINUE) {
      this.roundState = round.payload;
      return round;
    }
  }

  endGame(): SprintGameEnd {
    this.roundState = undefined;
    const statistic = this.computeStatistics();
    if (statistic) statisticController.appendGame(statistic);
    return {
      result: GameResults.END,
      payload: this.gameState?.gameResults,
    };
  }

  generateRound(): GameResult | void {
    if (!this.gameState) return;
    const { words, notUsedWords } = { ...this.gameState };
    if (!notUsedWords.length) {
      return {
        result: GameResults.END,
        payload: this.gameState.gameResults,
      };
    }
    const word = notUsedWords.splice(Math.floor(Math.random() * notUsedWords.length), 1)[0];
    const variative = [...words];
    const variants = [...new Array(1)].map(() => {
      let fakeWord: Word;
      let id: string;
      do {
        const randIndex = Math.floor(Math.random() * variative.length);
        const fakeWordArray = variative.splice(randIndex, 1);
        [fakeWord] = fakeWordArray;
        if (fakeWord) {
          id = fakeWord._id || fakeWord.id;
        } else id = '0';
      } while (id === word._id || id === word.id);
      return fakeWord;
    });
    return {
      result: GameResults.CONTINUE,
      payload: {
        currentWord: word,
        words: [word, ...variants].sort(() => Math.random() - 0.5),
      },
    };
  }

  keyToggle(turn: boolean): void {
    const sprintRight = <HTMLButtonElement>document.querySelector('.sprint__btn-right');
    const sprintWrong = <HTMLButtonElement>document.querySelector('.sprint__btn-wrong');
    if (!sprintRight && !sprintWrong) return;
    if (turn) {
      sprintRight.disabled = true;
      sprintWrong.disabled = true;
    } else {
      sprintRight.disabled = false;
      sprintWrong.disabled = false;
    }
  }

  isDisabledButtons(): boolean | undefined {
    const sprintRight = <HTMLButtonElement>document.querySelector('.sprint__btn-right');
    const sprintWrong = <HTMLButtonElement>document.querySelector('.sprint__btn-wrong');
    if (!sprintRight && !sprintWrong) return;
    if (sprintRight.disabled && sprintWrong.disabled) {
      return true;
    }
    return false;
  }

  async guessWordSprint(answer: boolean): Promise<void | GameContinue | GameEnd> {
    if (!this.roundState || !this.gameState) return;
    const minArraySize = 3;
    const currentId = this.roundState?.currentWord._id || this.roundState?.currentWord.id;
    const result: { guessed: boolean; result: string } & Word = {
      guessed: false,
      result: 'existing',
      ...this.roundState.currentWord,
    };

    if (this.gameState?.notUsedWords.length <= minArraySize) {
      const newWords = await this.generator.getNew();
      this.gameState.words = [...this.gameState.words, ...newWords];
      this.gameState.notUsedWords = [...this.gameState.notUsedWords, ...newWords];
    }
    if (answer) {
      result.guessed = true;
      const word = await wordController.guessCorrect(currentId);
      if (word) result.result = word.result;
      this.scoreHandlerRight();
    } else {
      const word = await wordController.guessIncorrect(currentId);
      if (word) result.result = word.result;
      this.scoreHandlerWrong();
    }
    const round = this.generateRound();

    this.gameState?.gameResults.push(result);
    if (round) {
      if (round.result === GameResults.CONTINUE) {
        this.roundState = round.payload;
        round.wordInfo = {
          guessed: result.guessed,
          result: result.result,
        };
      } else {
        this.roundState = undefined;
        const statistic = this.computeStatistics();
        if (statistic) statisticController.appendGame(statistic);
      }
      return round;
    }

    return round;
  }

  scoreHandlerWrong(): void {
    const scoreSpan = <HTMLSpanElement>document.querySelector('.sprint__score-per-word');
    const SCORE_START = 10;
    if (this.seria > this.maxSeria) {
      this.maxSeria = this.seria;
    }
    this.seria = 0;
    this.scoreMultiply = SCORE_START;
    if (scoreSpan) {
      scoreSpan.innerHTML = String(this.scoreMultiply);
    }
  }

  scoreHandlerRight(): void {
    this.seria += 1;
    const scoreMultiply = 3;
    this.score += this.scoreMultiply;
    const score = <HTMLDivElement>document.querySelector('.sprint__score');
    if (score) {
      score.innerHTML = String(this.score);
    }
    if ((this.seria / scoreMultiply) % 1 === 0) {
      this.scoreMultiply *= 2;
      const scoreSpan = <HTMLSpanElement>document.querySelector('.sprint__score-per-word');
      if (scoreSpan) {
        scoreSpan.innerHTML = String(this.scoreMultiply);
      }
    }
  }

  private computeStatistics(): GameStatisticMetadata | void {
    if (!this.gameState) return;
    this.maxSeria = this.seria > this.maxSeria ? this.seria : this.maxSeria;
    const { gameResults } = this.gameState;
    const newWords = this.computeNewWords(gameResults);
    const words = gameResults.length;
    const accuracy = this.computeAccuracy(gameResults);
    const statisticMetadata: GameStatisticMetadata = {
      type: StatisticTypes.SPRINT,
      newWords,
      words,
      accuracy,
      seria: this.maxSeria,
    };

    return statisticMetadata;
  }

  private computeNewWords(words: GameWord[]): number {
    return words.reduce((prev, cur) => {
      if (cur.result === 'new') return prev + 1;
      return prev;
    }, 0);
  }

  private computeAccuracy(words: GameWord[]): number {
    return (
      words.reduce((prev, cur) => {
        if (cur.guessed) return prev + NUMBER_FOR_CORRECT_REQUEST;
        return prev;
      }, 0) / words.length
    );
  }
}
