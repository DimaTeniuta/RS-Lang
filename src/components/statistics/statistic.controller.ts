import authController from '../auth/auth.controller';
import httpController from '../http/http.controller';
import { Statistic } from '../types/http.types';
import {
  DayStat,
  GameStatistic,
  GameStatisticMetadata,
  initialStatistics,
  StatisticOptional,
  WordStatistic,
} from '../types/statistic.types';

class StatisticController {
  async getStatistic(): Promise<Statistic> {
    if (authController.isAuthenticated) {
      const statistic = await httpController.getUserStatistic(
        authController.userId,
        authController.token
      );
      if (statistic) {
        const { optional } = statistic;
        return {
          ...statistic,
          optional: this.aggregateStatisticOptional(optional),
        };
      }
    }
    return {
      learnedWords: 0,
      optional: {
        ...initialStatistics,
      },
    };
  }

  async appendGame(metadata: GameStatisticMetadata): Promise<null | Statistic> {
    if (!authController.isAuthenticated) return null;
    const {
      type, newWords, words, accuracy, seria
    } = metadata;
    const { learnedWords, optional }: Statistic = (await this.getStatistic()) || {
      learnedWords: 0,
      optional: { ...initialStatistics },
    };
    const validatedOptional = this.aggregateStatisticOptional(optional);
    const { [type]: old, words: wordStatistic } = validatedOptional;
    const newWordStatistic: WordStatistic = this.aggregateWordsStatistic(wordStatistic, metadata);
    const newGameStatistic: GameStatistic = {
      newWords: old.newWords + newWords,
      words: old.words + words,
      accuracy: (old.accuracy * old.words + accuracy * words) / (old.words + words),
      maxSeria: seria > old.maxSeria ? seria : old.maxSeria,
    };
    const alltime = this.allTimeAggregate({
      alltime: JSON.parse(validatedOptional.alltime),
      metadata: {
        learnedWords,
        optional: {
          ...validatedOptional,
          [type]: newGameStatistic,
          words: newWordStatistic,
        },
      },
    });
    const newOptional: StatisticOptional = {
      ...validatedOptional,
      [type]: newGameStatistic,
      words: newWordStatistic,
      alltime: JSON.stringify(alltime),
    };
    const result = await httpController.updateUserStatistic(
      authController.userId,
      authController.token,
      {
        learnedWords,
        optional: newOptional,
      }
    );
    if (result) {
      return result;
    }
    return null;
  }

  private aggregateWordsStatistic(
    wordStatistic: WordStatistic,
    metadata: GameStatisticMetadata
  ): WordStatistic {
    const { newWords, words, accuracy } = metadata;
    return {
      newWords: wordStatistic.newWords + newWords,
      words: wordStatistic.words + words,
      accuracy:
        (wordStatistic.accuracy * wordStatistic.words + accuracy * words)
        / (wordStatistic.words + words),
      learnedWords: wordStatistic.learnedWords,
    };
  }

  private aggregateStatisticOptional(
    optional: StatisticOptional = { ...initialStatistics }
  ): StatisticOptional {
    const { time } = optional;
    const optionalDate = new Date(time).getUTCDate();
    const currentDate = new Date();
    const alltime = optional.alltime || JSON.stringify([]);
    if (Number.isNaN(optionalDate) || currentDate.getUTCDate() !== optionalDate) {
      return {
        ...initialStatistics,
        alltime,
      };
    }
    return { ...optional };
  }

  async addLearnedWord(): Promise<void | Statistic> {
    const { learnedWords, optional }: Statistic = (await this.getStatistic()) || {
      learnedWords: 0,
      optional: { ...initialStatistics },
    };
    const newLearnedWords = learnedWords + 1;
    const newOptional = this.aggregateStatisticOptional(optional);
    const alltime = this.allTimeAggregate({
      alltime: JSON.parse(newOptional.alltime),
      metadata: {
        learnedWords: learnedWords + 1,
        optional,
      },
    });

    return httpController.updateUserStatistic(authController.userId, authController.token, {
      learnedWords: newLearnedWords,
      optional: {
        ...newOptional,
        words: {
          ...newOptional.words,
          learnedWords: newOptional.words.learnedWords + 1,
        },
        alltime: JSON.stringify(alltime),
      },
    });
  }

  private allTimeAggregate({
    alltime = [],
    metadata,
  }: {
    alltime: DayStat[];
    metadata: Statistic;
  }) {
    const {
      learnedWords,
      optional: {
        words: { newWords },
      },
    } = metadata;
    const currentDate = new Date();

    currentDate.setUTCHours(0);
    currentDate.setUTCMinutes(0);
    currentDate.setUTCSeconds(0);
    currentDate.setUTCMilliseconds(0);
    const array: DayStat[] = alltime || [];
    const existing = array.filter((element) => element.time === currentDate.getTime());
    if (!existing.length) {
      const object: DayStat = {
        time: currentDate.getTime(),
        new: newWords,
        learned: learnedWords,
      };
      return [...alltime, object];
    }
    const object: DayStat = {
      ...existing[0],
      new: newWords,
      learned: learnedWords,
    };
    array.splice(array.indexOf(existing[0]), 1, object);
    return array;
  }
}

const statisticController = new StatisticController();

export default statisticController;
