import authController from '../auth/auth.controller';
import { Statistic } from '../types/http.types';
import { GameStatistic, WordStatistic } from '../types/statistic.types';
import { chartView } from './chart/chart.view';
import statisticController from './statistic.controller';

class StatisticView {
  template: HTMLTemplateElement;

  constructor() {
    this.template = <HTMLTemplateElement>document.querySelector('#statistic-page');
  }

  async render(node: HTMLElement): Promise<void> {
    if (authController.isAuthenticated) {
      const container = <DocumentFragment> this.template.content.cloneNode(true);
      const statistic = await statisticController.getStatistic();
      this.appendStatisticOnPage(container, statistic);
      node.append(container);
      chartView.renderChart(statistic);
    } else {
      const templateModalWindow = <HTMLTemplateElement>document.querySelector('#statistics-modal-window');
      const modalWindow = <DocumentFragment> templateModalWindow.content.cloneNode(true);
      node.append(modalWindow);
    }
  }

  private appendStatisticOnPage(container: DocumentFragment, statistic: Statistic) {
    const { optional } = statistic;
    const {
      words, audioCall, sprint
    } = optional;
    this.appendWordStatistic(container, words);
    this.appendAudioStatistic(container, audioCall);
    this.appendSprintStatistic(container, sprint);
  }

  private appendWordStatistic(container: DocumentFragment, words: WordStatistic): void {
    const { learnedWords, accuracy, newWords } = words;
    const wordContainer = <HTMLElement>container.querySelector('.statistics-words');

    (<HTMLElement>wordContainer.querySelector('.statistics-words-new')).textContent = newWords.toString();
    (<HTMLElement>wordContainer.querySelector('.statistics-words-accuracy')).textContent = `${(
      accuracy * 100
    ).toFixed(2)}%`;
    (<HTMLElement>wordContainer.querySelector('.statistics-words-learned')).textContent = learnedWords.toString();
  }

  private appendAudioStatistic(container: DocumentFragment, audio: GameStatistic): void {
    const { maxSeria, accuracy, newWords } = audio;
    const wordContainer = <HTMLElement>container.querySelector('.statistics-audioCall');

    (<HTMLElement>wordContainer.querySelector('.statistics-words-new')).textContent = newWords.toString();
    (<HTMLElement>wordContainer.querySelector('.statistics-words-accuracy')).textContent = `${(
      accuracy * 100
    ).toFixed(2)}%`;
    (<HTMLElement>wordContainer.querySelector('.statistics-words-seria')).textContent = maxSeria.toString();
  }

  private appendSprintStatistic(container: DocumentFragment, audio: GameStatistic): void {
    const { maxSeria, accuracy, newWords } = audio;
    const wordContainer = <HTMLElement>container.querySelector('.statistics-sprint');

    (<HTMLElement>wordContainer.querySelector('.statistics-words-new')).textContent = newWords.toString();
    (<HTMLElement>wordContainer.querySelector('.statistics-words-accuracy')).textContent = `${(
      accuracy * 100
    ).toFixed(2)}%`;
    (<HTMLElement>wordContainer.querySelector('.statistics-words-seria')).textContent = maxSeria.toString();
  }
}

const statisticView = new StatisticView();

export default statisticView;
