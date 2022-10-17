import authController from '../auth/auth.controller';
import httpController from '../http/http.controller';
import statisticController from '../statistics/statistic.controller';
import { AggregatedWord, UserWord, Word } from '../types/http.types';
import { GuessedWord, GuessResult, WordDifficulty } from '../types/word.types';
import { NUMBER_FOR_CORRECT_REQUEST } from '../variables/general.variables';
import { SERIA_FOR_HARD, SERIA_FOR_NORMAL } from '../variables/word.variables';

const initialOptional = {
  seria: 0,
  correct: 0,
  incorrect: 0,
};

class WordController {
  // GET All words. If user is authorized, get additional userWord: UserWord field.
  async getWords(group = 0, page = 0): Promise<AggregatedWord[]> {
    const { isAuthenticated } = authController;

    if (isAuthenticated) {
      const info = await httpController.getAggregatedWords(
        authController.userId,
        authController.token,
        group,
        JSON.stringify({ page })
      );

      if (info) {
        return info[0].paginatedResults;
      }
    }
    return httpController.getWords(group, page);
  }

  // Get words from page that are not solved. If user isn't loggined, get all words from page
  async getNotSolved(group = 0, page = 0): Promise<Word[] | undefined> {
    const { isAuthenticated } = authController;
    if (isAuthenticated) {
      const info = await httpController.getAggregatedWords(
        authController.userId,
        authController.token,
        group,
        JSON.stringify({
          page,
          'userWord.difficulty': {
            $ne: WordDifficulty.SOLVED,
          },
        })
      );
      if (info) {
        return info[0].paginatedResults;
      }
    }
    return httpController.getWords(group, page);
  }

  // Get user hard words.
  async getHardWords(): Promise<AggregatedWord[] | []> {
    const { isAuthenticated } = authController;
    if (isAuthenticated) {
      const object = {
        'userWord.difficulty': WordDifficulty.HARD,
      };
      const info = await httpController.getAggregatedWords(
        authController.userId,
        authController.token,
        undefined,
        JSON.stringify(object)
      );
      if (info) {
        return info[0].paginatedResults;
      }
    }

    return [];
  }

  // Mark that word is guessed in game correctly
  async guessCorrect(wordId: string): Promise<GuessedWord | void> {
    const { isAuthenticated } = authController;
    if (!isAuthenticated) return;
    const userWord = await httpController.getUserWord(
      authController.userId,
      wordId,
      authController.token
    );
    if (userWord) {
      const { difficulty, optional = { ...initialOptional } } = userWord;
      const { seria, correct } = optional;
      let newDifficulty: string = difficulty;
      if (
        (seria === SERIA_FOR_NORMAL - NUMBER_FOR_CORRECT_REQUEST
        && difficulty === WordDifficulty.STANDARD)
        || (seria === SERIA_FOR_HARD - NUMBER_FOR_CORRECT_REQUEST
        && difficulty === WordDifficulty.HARD)
      ) {
        if (userWord.difficulty !== WordDifficulty.SOLVED) statisticController.addLearnedWord();
        newDifficulty = WordDifficulty.SOLVED;
      }
      const word: UserWord = {
        difficulty: newDifficulty,
        optional: {
          ...optional,
          correct: correct + NUMBER_FOR_CORRECT_REQUEST,
          seria: seria + NUMBER_FOR_CORRECT_REQUEST,
        },
      };
      const result = <UserWord>(
        await httpController.updateUserWord(
          authController.userId,
          wordId,
          word,
          authController.token
        )
      );
      return {
        result:
          userWord.optional.correct === 0 && userWord.optional.incorrect === 0
            ? GuessResult.NEW_WORD
            : GuessResult.EXISTING,
        ...result,
      };
    }
    const word: UserWord = {
      difficulty: WordDifficulty.STANDARD,
      optional: {
        seria: 1,
        correct: 1,
        incorrect: 0,
      },
    };
    const result = <UserWord>(
      await httpController.createUserWord(authController.userId, wordId, word, authController.token)
    );
    return {
      result: GuessResult.NEW_WORD,
      ...result,
    };
  }

  // Mark that word is guessed in game incorrectly
  async guessIncorrect(wordId: string): Promise<GuessedWord | void> {
    const { isAuthenticated } = authController;
    if (!isAuthenticated) return;
    const userWord = await httpController.getUserWord(
      authController.userId,
      wordId,
      authController.token
    );
    if (userWord) {
      const { difficulty, optional = { ...initialOptional } } = userWord;
      const { incorrect } = optional;
      // eslint-disable-next-line operator-linebreak
      const newDifficulty: string =
        difficulty === WordDifficulty.HARD ? WordDifficulty.HARD : WordDifficulty.STANDARD;
      const word: UserWord = {
        difficulty: newDifficulty,
        optional: {
          ...optional,
          incorrect: incorrect + 1,
          seria: 0,
        },
      };
      const result = <UserWord>(
        await httpController.updateUserWord(
          authController.userId,
          wordId,
          word,
          authController.token
        )
      );
      return {
        ...result,
        result: GuessResult.EXISTING,
      };
    }
    const word: UserWord = {
      difficulty: WordDifficulty.STANDARD,
      optional: {
        seria: 0,
        correct: 0,
        incorrect: 1,
      },
    };
    const result = <UserWord>(
      await httpController.createUserWord(authController.userId, wordId, word, authController.token)
    );
    return {
      ...result,
      result: GuessResult.NEW_WORD,
    };
  }

  // Mark that user solved this word
  async markAsSolved(wordId: string): Promise<UserWord | void> {
    const { isAuthenticated } = authController;
    if (!isAuthenticated) return;
    const userWord = await httpController.getUserWord(
      authController.userId,
      wordId,
      authController.token
    );
    if (userWord) {
      const { optional = { ...initialOptional } } = userWord;
      const newDifficulty: string = WordDifficulty.SOLVED;
      const word: UserWord = {
        difficulty: newDifficulty,
        optional,
      };
      if (userWord.difficulty !== WordDifficulty.SOLVED) statisticController.addLearnedWord();

      return httpController.updateUserWord(
        authController.userId,
        wordId,
        word,
        authController.token
      );
    }
    const word: UserWord = {
      difficulty: WordDifficulty.SOLVED,
      optional: { ...initialOptional },
    };
    statisticController.addLearnedWord();
    return httpController.createUserWord(authController.userId, wordId, word, authController.token);
  }

  // Mark that this word is hard for user.
  async markAsHard(wordId: string): Promise<UserWord | void> {
    const { isAuthenticated } = authController;
    if (!isAuthenticated) return;
    const userWord = await httpController.getUserWord(
      authController.userId,
      wordId,
      authController.token
    );
    if (userWord) {
      const { optional = { ...initialOptional } } = userWord;
      const newDifficulty: string = WordDifficulty.HARD;
      const word: UserWord = {
        difficulty: newDifficulty,
        optional,
      };
      return httpController.updateUserWord(
        authController.userId,
        wordId,
        word,
        authController.token
      );
    }
    const word: UserWord = {
      difficulty: WordDifficulty.HARD,
      optional: { ...initialOptional },
    };
    return httpController.createUserWord(authController.userId, wordId, word, authController.token);
  }

  // Mark that this word has standard difficulty (f.e. toggle off hard word)
  async markAsNormal(wordId: string): Promise<UserWord | void> {
    const { isAuthenticated } = authController;
    if (!isAuthenticated) return;
    const userWord = await httpController.getUserWord(
      authController.userId,
      wordId,
      authController.token
    );
    if (userWord) {
      const { optional = { ...initialOptional } } = userWord;
      const newDifficulty: string = WordDifficulty.STANDARD;
      const word: UserWord = {
        difficulty: newDifficulty,
        optional,
      };
      return httpController.updateUserWord(
        authController.userId,
        wordId,
        word,
        authController.token
      );
    }
    const word: UserWord = {
      difficulty: WordDifficulty.STANDARD,
      optional: { ...initialOptional },
    };
    return httpController.createUserWord(authController.userId, wordId, word, authController.token);
  }
}

const wordController = new WordController();
export default wordController;
