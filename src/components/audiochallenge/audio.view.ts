import { appView } from '../app/app.view';
import localStorageModule from '../localStorage/localStorage';
import {
  ButtonRoles,
  GameContinue,
  GameEnd,
  GameResults,
  GameWord,
  KeyOfKeyboard,
  RoundState,
} from '../types/game.types';
import { Word } from '../types/http.types';
import { Page, Routing } from '../types/routing';
import { GuessResult } from '../types/word.types';
import { changeActiveClassForNav, removeClassListForElements } from '../utils/general-functions';
import { URL_SITE } from '../variables/general.variables';
import AudioChallengeController from './audio.controller';

class AudioChallengeView {
  templatePreview: HTMLTemplateElement;
  controller: AudioChallengeController;
  level = 1;
  private metadata: {
    group: number;
    page: number;
  } | null = null;
  round: RoundState | undefined;
  node: HTMLElement | undefined;
  isLocked = false;

  constructor() {
    this.templatePreview = <HTMLTemplateElement>document.querySelector('#audio-preview');
    this.controller = new AudioChallengeController();
  }

  render(node: HTMLElement, metadata?: { group: number; page: number }): void {
    this.node = node;
    const container = <DocumentFragment> this.templatePreview.content.cloneNode(true);
    this.addStartListener(
      <HTMLButtonElement>container.querySelector('.audio-challenge__start-button')
    );
    const select = <HTMLSelectElement>container.querySelector('select');
    if (metadata) {
      this.metadata = metadata;
      select.style.display = 'none';
    } else {
      this.manageLevel(<HTMLSelectElement>container.querySelector('select'));
    }
    node.append(container);
    changeActiveClassForNav('nav__list__audio-call-btn');
  }

  private manageLevel(select: HTMLSelectElement): void {
    select.addEventListener('change', () => {
      this.level = +select.value;
    });
  }

  private addStartListener(button: HTMLButtonElement): void {
    button.addEventListener('click', async () => {
      const result = await this.controller.startGame(this.level, this.metadata);
      if (result && result.result === GameResults.CONTINUE) {
        this.round = result.payload;
        this.startRound();
      }
    });
  }

  private startRound(): void {
    if (!this.node || !this.round) return;
    this.node.innerHTML = '';

    const container = <DocumentFragment>(
      (<HTMLTemplateElement>document.querySelector('#audio-game')).content.cloneNode(true)
    );
    const audio = <HTMLAudioElement>container.querySelector('.audio-challenge__audio');
    audio.src = URL_SITE + this.round.currentWord.audio;
    const buttons = Array.from(
      <NodeListOf<HTMLButtonElement>>container.querySelectorAll('.audio-challenge__select-variant')
    );
    buttons.forEach((btn, idx) => {
      if (!this.round) return;
      if (!this.round.words[idx]) return;
      const button = btn;
      button.textContent = this.round.words[idx].wordTranslate;
    });
    this.node.append(container);
    this.node.onclick = this.buttonListener.bind(this);
    document.onkeydown = this.keyListener.bind(this);
    this.isLocked = false;
  }

  private async buttonListener(ev: MouseEvent): Promise<void> {
    const target = <HTMLButtonElement>ev.target;
    if (!target.dataset.role || !this.node) return;
    const { role } = target.dataset;
    let result: GameContinue | GameEnd | void;
    switch (role) {
      case ButtonRoles.PLAY:
        target.parentElement?.querySelector('audio')?.play();
        break;
      case ButtonRoles.CHOICE:
        if (!this.isLocked && this.round) {
          this.isLocked = true;
          const choice = +(<string>target.dataset.number) - 1;
          result = await this.controller.guessWord(
            this.round.words[choice]._id || this.round.words[choice].id
          );
        }
        break;
      case ButtonRoles.SKIP:
        if (!this.isLocked) {
          target.setAttribute('data-role', ButtonRoles.PENDING);
          result = await this.controller.guessWord('0');
        }
        break;
      case ButtonRoles.NEXT:
        target.setAttribute('data-role', ButtonRoles.PENDING);
        this.startRound();
        break;
      case ButtonRoles.NAV_MAIN:
        localStorageModule.write<Routing>('pageRoutingObj', { page: Page.main });
        removeClassListForElements('nav__btn', 'active');
        appView.render();
        document.onkeydown = null;
        this.node.onclick = null;
        break;
      case ButtonRoles.NAV_BOOK:
        localStorageModule.write<Routing>('pageRoutingObj', { page: Page.book });
        appView.render();
        changeActiveClassForNav('nav__list__book-btn');

        document.onkeydown = null;
        this.node.onclick = null;
        break;
      default:
        break;
    }

    if (!result) return;
    this.aggregateResult(result);
  }

  private aggregateResult(result: GameContinue | GameEnd): void {
    switch (result.result) {
      case GameResults.CONTINUE:
        this.round = result.payload;
        this.guessResult(result.wordInfo);
        break;
      case GameResults.END:
        this.round = undefined;
        this.renderResults(result.payload);
        break;
      default:
        break;
    }
  }

  private guessResult(result?: { guessed: boolean; result: string }) {
    if (!result) return;
    const container = <HTMLElement> this.node?.querySelector('.audio-challenge__container-result');
    container.textContent = (result.guessed ? 'Правильно!' : 'Неправильно')
    + (result.result === GuessResult.NEW_WORD ? ' Это было новое слово' : '');
    const nextBTN = <HTMLButtonElement> this.node?.querySelector('.audio-challenge__start-button');
    nextBTN.classList.add('audio-challenge__start-button-next');
    nextBTN.dataset.role = ButtonRoles.NEXT;
    nextBTN.textContent = 'Продолжить';

    const buttons = Array.from(
      <NodeListOf<HTMLButtonElement>> this.node?.querySelectorAll('.audio-challenge__select-variant')
    );
    buttons.forEach((btn) => {
      const button = btn;
      button.disabled = true;
    });
  }

  private renderResults(
    results: ({
      guessed: boolean;
      result: string;
    } & Word)[]
  ): void {
    if (!this.node) return;
    this.node.innerHTML = '';
    const container = <DocumentFragment>(
      (<HTMLTemplateElement>document.querySelector('#audio-results')).content.cloneNode(true)
    );
    const list = <HTMLUListElement>container.querySelector('.audio-challenge__results');
    results.forEach((res) => list.append(this.createResultItem(res)));
    this.node.append(container);
  }

  private async keyListener(ev: KeyboardEvent): Promise<void> {
    let result: GameContinue | GameEnd | void;
    if (!this.round) return;
    switch (ev.code) {
      case KeyOfKeyboard.KEY_1:
      case KeyOfKeyboard.KEY_2:
      case KeyOfKeyboard.KEY_3:
      case KeyOfKeyboard.KEY_4:
      case KeyOfKeyboard.KEY_5: {
        if (this.isLocked) return;
        const btn = <HTMLButtonElement>document.querySelector('.audio-challenge__start-button');
        const dataAtr = btn.getAttribute('data-role');
        if (dataAtr === ButtonRoles.SKIP) {
          this.isLocked = true;
          const code = Number(ev.code.charAt(ev.code.length - 1)) - 1;
          const wordId: string = this.round.words[code]._id || this.round.words[code].id;
          result = await this.controller.guessWord(wordId);
        }
        break;
      }
      case KeyOfKeyboard.SPACE:
        (<HTMLAudioElement>document.querySelector('.audio-challenge__audio')).play();
        break;
      case KeyOfKeyboard.ENTER:
      case KeyOfKeyboard.NUMPAD_ENTER: {
        const btn = <HTMLButtonElement>document.querySelector('.audio-challenge__start-button');
        if (btn.dataset.role === ButtonRoles.SKIP && !this.isLocked) {
          btn.setAttribute('data-role', ButtonRoles.PENDING);
          result = await this.controller.guessWord('0');
          this.startRound();
        } else if (btn.dataset.role === ButtonRoles.NEXT) {
          btn.setAttribute('data-role', ButtonRoles.PENDING);
          this.startRound();
        }
        break;
      }
      default:
        break;
    }
    if (!result) return;
    this.aggregateResult(result);
  }

  private createResultItem(word: GameWord): DocumentFragment {
    const {
      guessed, result, word: wordText, wordTranslate
    } = word;
    const container = <DocumentFragment>(
      (<HTMLTemplateElement>document.querySelector('#audio-result-element')).content.cloneNode(true)
    );
    const status = <HTMLSpanElement>(
      container.querySelector('.audio-challenge__results-element-status')
    );
    const extra = <HTMLSpanElement>(
      container.querySelector('.audio-challenge__results-element-extra')
    );
    const wordEl = <HTMLSpanElement>(
      container.querySelector('.audio-challenge__results-element-word')
    );
    if (guessed) status.classList.add('audio-challenge__results-element-status-guessed');
    wordEl.textContent = `${wordText} ${wordTranslate}`;
    if (result === GuessResult.NEW_WORD) extra.textContent = 'НОВОЕ';
    return container;
  }
}

const audioView = new AudioChallengeView();
export default audioView;
