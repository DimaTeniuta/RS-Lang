import { Statistic } from '../../types/http.types';
import { ChartsValue, DayStat } from '../../types/statistic.types';

export class ChartController {
  parseStatistics(statistics: Statistic): ChartsValue {
    const learnedWords: number[] = [];
    const newWords: number[] = [];
    const currentDate: string[] = [];
    const arrStatistics: DayStat[] = JSON.parse(statistics.optional.alltime);

    arrStatistics.forEach((el) => {
      const date = new Date(el.time);
      currentDate.push(date.toLocaleDateString('ru'));
      learnedWords.push(el.learned);
      newWords.push(el.new);
    });

    return {
      data: currentDate,
      learntWords: learnedWords,
      newWords
    };
  }
}

export const chartController = new ChartController();
