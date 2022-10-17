import gameController from '../game/game.controller';
import statisticController from '../statistics/statistic.controller';
import {
  GameContinue,
  GameResult,
  GameResults,
  GameStartMetadata,
  GameState,
  GameWord,
  RoundState,
} from '../types/game.types';
import { AggregatedWord, Word } from '../types/http.types';
import { GameStatisticMetadata, StatisticTypes } from '../types/statistic.types';
import { GuessResult } from '../types/word.types';
import { randomNumberInRange } from '../utils/general-functions';
import { NUMBER_FOR_CORRECT_REQUEST } from '../variables/general.variables';
import { AUDIOCALL_ANSWER_NUMBER } from '../variables/word.variables';
import wordController from '../words/word.controller';

export default class AudioChallengeController {
  gameState: GameState | undefined;
  roundState: RoundState | undefined;
  maxSeria = 0;
  seria = 0;
  async startGame(
    level: number,
    metadata: GameStartMetadata | null
  ): Promise<GameContinue | undefined> {
    this.maxSeria = 0;
    this.seria = 0;
    let words: AggregatedWord[];
    if (metadata) {
      words = await gameController.generateAccordingToPage(metadata.group, metadata.page);
    } else {
      words = await gameController.generateAccordingToGroup(level - NUMBER_FOR_CORRECT_REQUEST);
    }
    this.gameState = {
      gameResults: [],
      words: [...words],
      notUsedWords: [...words],
    };
    const round = this.generateRound();
    if (round && round.result === GameResults.CONTINUE) {
      this.roundState = round.payload;
      return round;
    }
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
    const randomIndex = randomNumberInRange({ max: notUsedWords.length });
    const word = notUsedWords.splice(randomIndex, 1)[0];
    const variating = [...words];
    const variants = [...new Array(AUDIOCALL_ANSWER_NUMBER - 1)]
      .map(() => this.selectVariants(word, variating));
    return {
      result: GameResults.CONTINUE,
      payload: {
        currentWord: word,
        words: [word, ...variants].sort(() => Math.random() - 0.5),
      },
    };
  }

  async guessWord(wordId: string): Promise<void | GameResult> {
    if (!this.roundState) return;
    const { currentWord } = this.roundState;
    const currentId = currentWord._id || currentWord.id;
    const result: GameWord = {
      guessed: false,
      result: GuessResult.EXISTING,
      ...this.roundState.currentWord,
    };
    if (wordId === currentId) {
      result.guessed = true;
      const word = await wordController.guessCorrect(currentId);
      if (word) result.result = word.result;
      this.seria += 1;
    } else {
      const word = await wordController.guessIncorrect(currentId);
      if (word) result.result = word.result;
      this.maxSeria = Math.max(this.seria, this.maxSeria);
      this.seria = 0;
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

  private computeStatistics(): GameStatisticMetadata | void {
    if (!this.gameState) return;
    this.maxSeria = Math.max(this.seria, this.maxSeria);
    const { gameResults } = this.gameState;
    const newWords = this.computeNewWords(gameResults);
    const accuracy = this.computeAccuracy(gameResults);
    const statisticMetadata: GameStatisticMetadata = {
      type: StatisticTypes.AUDIOCALL,
      newWords,
      words: gameResults.length,
      accuracy,
      seria: this.maxSeria,
    };
    return statisticMetadata;
  }

  private computeNewWords(words: GameWord[]): number {
    return words.reduce((prev, cur) => {
      if (cur.result === 'new') return prev + NUMBER_FOR_CORRECT_REQUEST;
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

  private selectVariants(selected: Word, variants: Word[]): Word {
    let fakeer: Word;
    let id: string;
    do {
      const randIndex = randomNumberInRange({ max: variants.length });
      [fakeer] = variants.splice(randIndex, 1);
      if (fakeer) id = fakeer._id || fakeer.id;
      else id = '0';
    } while (id === selected._id || id === selected.id);
    return fakeer;
  }
}
