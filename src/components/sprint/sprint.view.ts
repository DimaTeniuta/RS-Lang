import { appView } from '../app/app.view';
import localStorageModule from '../localStorage/localStorage';
import {
  GameContinue, GameEnd, GameResults, Metadata, RoundState
} from '../types/game.types';
import { Word } from '../types/http.types';
import { Page, Routing } from '../types/routing';
import { changeActiveClassForNav, removeClassListForElements } from '../utils/general-functions';
import SprintController from './sprint.controller';

class SprintView {
  templatePreview: HTMLTemplateElement;
  controller: SprintController;
  level = 1;
  round: RoundState | undefined;
  node: HTMLElement | undefined;
  isFinished = false;
  private metadata: Metadata | null = null;
  private isStarted: boolean;

  constructor() {
    this.templatePreview = <HTMLTemplateElement>document.querySelector('#sprint-page');
    this.controller = new SprintController();
    this.isStarted = false;
  }

  render(node: HTMLElement, metadata?: Metadata): void {
    this.node = node;
    this.isFinished = false;
    const container = <DocumentFragment> this.templatePreview.content.cloneNode(true);
    this.addStartListener(<HTMLButtonElement>container.querySelector('.sprint__start'));
    this.node.innerHTML = '';
    const select = <HTMLSelectElement>container.querySelector('select');
    if (metadata) {
      this.metadata = metadata;
      select.style.display = 'none';
      this.level = metadata.group + 1;
    }
    this.manageLevel(select);
    changeActiveClassForNav('nav__list__sprint-btn');
    node.append(container);
  }

  private manageLevel(select: HTMLSelectElement): void {
    select.addEventListener('change', () => {
      this.level = +select.value;
    });
  }

  private addStartListener(button: HTMLButtonElement): void {
    this.isStarted = false;

    button.addEventListener('click', async () => {
      const select = document.querySelector('select');
      let result;
      if (select?.style.display === 'none') {
        result = await this.controller.startGame(this.level, true);
      } else {
        result = await this.controller.startGame(this.level, false);
      }
      if (this.node) this.node.innerHTML = '';
      const container = <DocumentFragment>(
        (<HTMLTemplateElement>document.querySelector('#sprint-game')).content.cloneNode(true)
      );

      this.node?.append(container);
      this.buttonHandlers();

      document.onkeydown = this.keyListener.bind(this);

      if (result && result.result === GameResults.CONTINUE) {
        this.round = result.payload;
        this.startRound();
      }
    });
  }

  private startRound(): void {
    if (!this.node || !this.round || this.isFinished) return;
    if (!this.isStarted) {
      this.isStarted = true;
      const timer = document.querySelector('.radial-timer');
      timer?.classList.add('s-animate');
      timer?.addEventListener('animationend', () => {
        this.isFinished = true;
        const { payload } = this.controller.endGame();
        if (!payload) return;
        this.renderResults(payload);
      });
    }
    const container = <HTMLDivElement>document.querySelector('.sprint__container');

    const wordEn = container.querySelector('.word-en');
    const wordRu = container.querySelector('.word-ru');
    if (wordEn) wordEn.innerHTML = this.round.currentWord.word;
    if (wordRu) wordRu.innerHTML = this.round.words[0].wordTranslate;
    this.controller.keyToggle(false);
  }

  private buttonHandlers(): void {
    const container = <HTMLDivElement>document.querySelector('.sprint__container');
    const buttonWrong = container.querySelector('.sprint__btn-wrong');
    const buttonRight = container.querySelector('.sprint__btn-right');
    buttonRight?.addEventListener('click', async () => {
      if (this.controller.isDisabledButtons()) return;
      this.controller.keyToggle(true);
      const result = await this.controller.guessWordSprint(
        this.round?.currentWord.word === this.round?.words[0].word
      );
      if (!result) return;
      switch (result.result) {
        case GameResults.CONTINUE:
          this.round = result.payload;
          this.startRound();
          break;
        case GameResults.END:
          this.renderResults(result.payload);
          break;
        default:
          break;
      }
    });
    buttonWrong?.addEventListener('click', async () => {
      if (this.controller.isDisabledButtons()) return;
      this.controller.keyToggle(true);
      const result = await this.controller.guessWordSprint(
        this.round?.currentWord.word !== this.round?.words[0].word
      );
      if (!result) return;
      switch (result.result) {
        case GameResults.CONTINUE:
          this.round = result.payload;
          this.startRound();
          break;
        case GameResults.END:
          this.renderResults(result.payload);
          break;
        default:
          break;
      }
    });
  }

  private renderResults(
    results: ({
      guessed: boolean;
      result: string;
    } & Word)[]
  ): void {
    if (this.node) this.node.innerHTML = '';
    this.isFinished = true;
    const container = <DocumentFragment>(
      (<HTMLTemplateElement>document.querySelector('#sprint-results')).content.cloneNode(true)
    );
    const scoreResult = this.controller.score;
    const scoreSpan = <HTMLSpanElement>container.querySelector('.sprint-score');
    scoreSpan.innerHTML = String(scoreResult);
    container.append();
    const list = <HTMLUListElement>container.querySelector('.audio-challenge__results');
    results.forEach((res) => list.append(this.createResultItem(res)));
    const mainPageBtn = container.querySelector(
      '.audio-challenge__start-button[data-role=navigate-main]'
    );
    const bookPageBtn = container.querySelector(
      '.audio-challenge__start-button[data-role=navigate-book]'
    );
    mainPageBtn?.addEventListener('click', () => {
      localStorageModule.write<Routing>('pageRoutingObj', { page: Page.main });
      appView.render();
      removeClassListForElements('nav__btn', 'active');
    });
    bookPageBtn?.addEventListener('click', () => {
      localStorageModule.write<Routing>('pageRoutingObj', { page: Page.book });
      appView.render();
      changeActiveClassForNav('nav__list__book-btn');
    });
    document.onkeydown = null;
    this.node?.append(container);
  }

  private async keyListener(ev: KeyboardEvent): Promise<void> {
    if (this.controller.isDisabledButtons()) return;
    let result: GameContinue | GameEnd | void;
    if (ev.code === 'Digit1') {
      this.controller.keyToggle(true);
      result = await this.controller.guessWordSprint(
        this.round?.currentWord.word !== this.round?.words[0].word
      );
    } else if (ev.code === 'Digit2') {
      this.controller.keyToggle(true);
      result = await this.controller.guessWordSprint(
        this.round?.currentWord.word === this.round?.words[0].word
      );
    }
    if (!result) return;
    switch (result.result) {
      case GameResults.CONTINUE:
        this.round = result.payload;
        this.startRound();
        break;
      case GameResults.END:
        this.renderResults(result.payload);
        break;
      default:
        break;
    }
  }

  private createResultItem(
    word: {
      guessed: boolean;
      result: string;
    } & Word
  ): DocumentFragment {
    const container = <DocumentFragment>((<HTMLTemplateElement>document.querySelector('#audio-result-element')).content.cloneNode(true));
    const status = <HTMLSpanElement>(container.querySelector('.audio-challenge__results-element-status'));
    const extra = <HTMLSpanElement>(container.querySelector('.audio-challenge__results-element-extra'));
    const wordEl = <HTMLSpanElement>(container.querySelector('.audio-challenge__results-element-word'));
    if (word.guessed) status.classList.add('audio-challenge__results-element-status-guessed');
    wordEl.textContent = `${word.word} ${word.wordTranslate}`;
    if (word.result === 'new') extra.textContent = 'НОВОЕ';
    return container;
  }
}

const sprintView = new SprintView();
export default sprintView;
