import localStorageModule from '../localStorage/localStorage';
import { AggregatedWord } from '../types/http.types';
import { WordDifficulty } from '../types/word.types';
import {
  addClassList,
  addClassListForElements,
  changeActiveClassForNav,
  listenClickOnBtn,
  removeClassesWhenCloseBurgerMenu,
  removeClassList,
  removeClassListForElements,
} from '../utils/general-functions';
import {
  FIRST_GROUP,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  URL_SITE,
  VALUE_DIFFICULT_GROUP,
} from '../variables/general.variables';
import bookController from './book.controller';
import BookPagination from './book.pagination';
import AudioCard from './card/card.audio';
import difficultCardModule from './card/card.difficult';
import studyCardModule from './card/card.study';
import scrollBook from './card/scroll.book';

class BookView {
  private addClassForSpecialCardBtn(element: AggregatedWord, parent: HTMLTemplateElement): void {
    const studyBtn = <HTMLParagraphElement>parent.content.querySelector('.book__btn-explore');
    const difficultBtn = <HTMLParagraphElement>parent.content.querySelector('.book__btn-difficult');

    studyBtn.classList.remove('active');
    difficultBtn.classList.remove('active');

    if (element.userWord?.difficulty === WordDifficulty.SOLVED) {
      studyBtn.classList.add('active');
    } else if (element.userWord?.difficulty === WordDifficulty.HARD) {
      difficultBtn.classList.add('active');
    }
  }

  private setValuePageBookPage(value: string): void {
    const page = <HTMLDivElement>document.querySelector('.book-pagination__number-page');
    page.textContent = value;
  }

  checkMinMaxSizePageBookPage(): void {
    const page = <HTMLDivElement>document.querySelector('.book-pagination__number-page');
    const pageValue = <string>page.textContent;

    if (pageValue === MIN_PAGE_SIZE) {
      addClassList('book-pagination__start-btn', 'not-active');
      addClassList('book-pagination__prev-btn', 'not-active');
      removeClassList('book-pagination__finish-btn', 'not-active');
      removeClassList('book-pagination__next-btn', 'not-active');
    } else if (pageValue === MAX_PAGE_SIZE) {
      addClassList('book-pagination__finish-btn', 'not-active');
      addClassList('book-pagination__next-btn', 'not-active');
      removeClassList('book-pagination__start-btn', 'not-active');
      removeClassList('book-pagination__prev-btn', 'not-active');
    } else {
      removeClassList('book-pagination__start-btn', 'not-active');
      removeClassList('book-pagination__prev-btn', 'not-active');
      removeClassList('book-pagination__finish-btn', 'not-active');
      removeClassList('book-pagination__next-btn', 'not-active');
    }
  }

  static getCurrentGroup(): string {
    const groups = <NodeListOf<Element>>document.querySelectorAll('.selector-list__group-btn');
    let group: string = FIRST_GROUP;
    groups.forEach((el) => {
      if (el.classList.contains('active')) {
        group = <string>el.getAttribute('data-group');
      }
    });

    return group;
  }

  private addAttributeForCardBtns(id: string, parent: HTMLTemplateElement): void {
    const btnListen = <HTMLParagraphElement>parent.content.querySelector('.book__btn-audio');
    const btnListenText = <HTMLParagraphElement>(parent.content.querySelector('.book__btn-audio__text'));
    const btnListenImg = <HTMLParagraphElement>(parent.content.querySelector('.book__btn-audio__img'));
    const btnStudy = <HTMLParagraphElement>parent.content.querySelector('.book__btn-explore');
    const btnStudyText = <HTMLParagraphElement>(parent.content.querySelector('.book__btn-explore__text'));
    const btnStudyImg = <HTMLParagraphElement>(parent.content.querySelector('.book__btn-explore__img'));
    const difficultBtn = <HTMLParagraphElement>parent.content.querySelector('.book__btn-difficult');
    const difficultBtnText = <HTMLParagraphElement>(parent.content.querySelector('.book__btn-difficult__text'));
    const difficultBtnImg = <HTMLParagraphElement>(parent.content.querySelector('.book__btn-difficult__img'));

    btnListen.setAttribute('data-id', `${id}`);
    btnListenText.setAttribute('data-id', `${id}`);
    btnListenImg.setAttribute('data-id', `${id}`);
    btnStudy.setAttribute('data-id', `${id}`);
    btnStudyText.setAttribute('data-id', `${id}`);
    btnStudyImg.setAttribute('data-id', `${id}`);
    difficultBtn.setAttribute('data-id', `${id}`);
    difficultBtnText.setAttribute('data-id', `${id}`);
    difficultBtnImg.setAttribute('data-id', `${id}`);
  }

  private showElementsForAuthorizedUser(parent: HTMLTemplateElement): void {
    const containerBtn = <HTMLButtonElement>parent.content.querySelector('.book__wrap-btn');
    const difficultBtn = <HTMLButtonElement>parent.content.querySelector('.book__btn-difficult');
    const studyBtn = <HTMLButtonElement>parent.content.querySelector('.book__btn-explore');

    const isAuthorizedUser: boolean = bookController.checkAuthorizedUser();

    if (isAuthorizedUser) {
      containerBtn.classList.add('show');
      studyBtn.classList.add('show');
      difficultBtn.classList.add('show');
    } else {
      containerBtn.classList.remove('show');
      studyBtn.classList.remove('show');
      difficultBtn.classList.remove('show');
    }
  }

  private showGameResult(element: AggregatedWord, parent: HTMLTemplateElement): void {
    const result: boolean = bookController.checkParticipationInGames(element);
    const wrapResult = <HTMLDivElement>parent.content.querySelector('.book__wrap-answer');
    const rightResult = <HTMLDivElement>parent.content.querySelector('.book__answer__right-value');
    const wrongResult = <HTMLDivElement>parent.content.querySelector('.book__answer__wrong-value');
    wrapResult.classList.remove('active');

    if (result) {
      const rightAnswer = <number>element.userWord?.optional.correct;
      const wrongAnswer = <number>element.userWord?.optional.incorrect;
      const percent: number = bookController.calculateRightAnswers(rightAnswer, wrongAnswer);
      const scale = <HTMLSpanElement>parent.content.querySelector('.book__answer__line__percent');

      scale.style.width = `${percent}%`;
      rightResult.innerHTML = String(element.userWord?.optional.correct);
      wrongResult.innerHTML = String(element.userWord?.optional.incorrect);
      wrapResult.classList.add('active');
    }
  }

  private addBackgroundBook(parent: HTMLTemplateElement, group: string): void {
    const path: string = bookController.choosePathForBackgroundBook(+group);
    const containerCards = <HTMLDivElement>document.querySelector('.book-page__wrap-card');
    const containerTextCard = <HTMLDivElement>parent.content.querySelector('.book__wrap-text');

    if (group === String(VALUE_DIFFICULT_GROUP)) {
      containerCards.style.backgroundImage = 'none';
      containerTextCard.style.backgroundImage = 'none';
    } else {
      containerCards.style.backgroundImage = `url(${path})`;
      containerTextCard.style.backgroundImage = `url(${path})`;
    }
  }

  private addContentInCard(element: AggregatedWord, group: string): void {
    const containerCard = <HTMLDivElement>document.querySelector('.book-page__wrap-card');
    const cardTemplate = <HTMLTemplateElement>document.querySelector('#card');
    const card = <HTMLDivElement>cardTemplate.content.querySelector('.book__card');
    const img = <HTMLDivElement>cardTemplate.content.querySelector('.book__image');
    const audioWord = <HTMLAudioElement>cardTemplate.content.querySelector('.book__audio-word');
    const audioMeaning = <HTMLAudioElement>(cardTemplate.content.querySelector('.book__audio-meaning'));
    const audioExample = <HTMLAudioElement>(cardTemplate.content.querySelector('.book__audio-example'));
    const word = <HTMLSpanElement>cardTemplate.content.querySelector('.book__word__word');
    const wordTranscription = <HTMLSpanElement>(cardTemplate.content.querySelector('.book__word__transcription'));
    const wordTranslate = <HTMLSpanElement>(cardTemplate.content.querySelector('.book__word__translate'));
    const wordEnFirst = <HTMLParagraphElement>(cardTemplate.content.querySelector('.book__word__example-en-first'));
    const wordRusFirst = <HTMLParagraphElement>(cardTemplate.content.querySelector('.book__word__example-rus-first'));
    const wordEnSecond = <HTMLParagraphElement>(cardTemplate.content.querySelector('.book__word__example-en-second'));
    const wordRusSecond = <HTMLParagraphElement>(cardTemplate.content.querySelector('.book__word__example-rus-second'));
    let currentId: string = element.id;

    if (element._id) {
      currentId = element._id;
    }
    card.setAttribute('data-card', `${currentId}`);
    img.style.backgroundImage = `url(${URL_SITE}${element.image})`;
    audioWord.src = `${URL_SITE}${element.audio}`;
    audioWord.setAttribute('data-audio-word', `${currentId}`);
    audioMeaning.src = `${URL_SITE}${element.audioMeaning}`;
    audioMeaning.setAttribute('data-audio-meaning', `${currentId}`);
    audioExample.src = `${URL_SITE}${element.audioExample}`;
    audioExample.setAttribute('data-audio-example', `${currentId}`);
    word.textContent = element.word;
    wordTranscription.innerHTML = element.transcription;
    wordTranslate.innerHTML = element.wordTranslate;
    wordEnFirst.innerHTML = element.textMeaning;
    wordRusFirst.innerHTML = element.textMeaningTranslate;
    wordEnSecond.innerHTML = element.textExample;
    wordRusSecond.innerHTML = element.textExampleTranslate;
    this.showGameResult(element, cardTemplate);
    this.showElementsForAuthorizedUser(cardTemplate);
    this.addAttributeForCardBtns(currentId, cardTemplate);
    this.addClassForSpecialCardBtn(element, cardTemplate);
    this.addBackgroundBook(cardTemplate, group);
    containerCard.append(cardTemplate.content.cloneNode(true));
  }

  showPagination(group: number): void {
    const containerPagination = <HTMLDivElement>document.querySelector('.book__wrap-controls');

    if (group === VALUE_DIFFICULT_GROUP) {
      containerPagination.classList.add('not-active');
    } else {
      containerPagination.classList.remove('not-active');
    }
  }

  private toggleClassStudiedPage(value: boolean): void {
    const groups = <NodeListOf<Element>>document.querySelectorAll('.selector-list__group-btn');

    if (value) {
      groups.forEach((el) => {
        el.classList.remove('studied');
        if (el.classList.contains('active') && !el.classList.contains('selector-list__group7')) {
          el.classList.add('studied');
        }
      });
    } else {
      groups.forEach((el) => {
        el.classList.remove('studied');
        if (el.classList.contains('active')) {
          el.classList.remove('studied');
        }
      });
    }
  }

  hideGameButtons(group: number): void {
    const resultLearning: boolean = bookController.checkCompleatLearnPage();

    if (resultLearning) {
      addClassList('book-btn__wrap', 'not-active');
      if (group !== VALUE_DIFFICULT_GROUP) {
        addClassListForElements('book__card', 'studied');
        addClassList('book-pagination__number-page', 'active');
      }
    } else {
      removeClassListForElements('book-pagination__number-page', 'active');
      removeClassList('book-btn__wrap', 'not-active');
      removeClassListForElements('book__card', 'studied');
    }

    this.toggleClassStudiedPage(resultLearning);
  }

  createCard(data: AggregatedWord[], group: string): void {
    const containerCard = <HTMLDivElement>document.querySelector('.book-page__wrap-card');
    containerCard.innerHTML = '';

    data.forEach((el) => {
      this.addContentInCard(el, group);
      this.hideGameButtons(+group);
    });
  }

  private showDifficultGroup(): void {
    const isAuthorizedUser: boolean = bookController.checkAuthorizedUser();
    const difficultGroup = <HTMLButtonElement>document.querySelector('.selector-list__group7');

    if (isAuthorizedUser) {
      difficultGroup.classList.add('show');
    } else {
      difficultGroup.classList.remove('show');
    }
  }

  async renderCurrentPageBook(group: string, page: string): Promise<void> {
    let currentGroup: string = group;
    let currentPage: string = page;
    if (bookController.checkDifficultGroupForNotAuthorizedUser(+group)) {
      currentGroup = FIRST_GROUP;
      currentPage = MIN_PAGE_SIZE;
    }
    scrollBook.hideDownBtn(+currentGroup);
    removeClassesWhenCloseBurgerMenu();
    this.showPagination(+currentGroup);
    this.showDifficultGroup();
    removeClassListForElements('selector-list__group-btn', 'active');
    addClassList(`selector-list__group-btn[data-group="${currentGroup}"]`, 'active');
    const data: AggregatedWord[] = await bookController.getWordArray(
      +currentGroup,
      +currentPage
    );
    this.showPagination(+currentGroup);
    this.createCard(data, currentGroup);
    this.setValuePageBookPage(currentPage);
    this.checkMinMaxSizePageBookPage();
    const bookPagination: BookPagination = new BookPagination();
    this.listenClickOnGroup();
    bookPagination.listenClickOnBtnPagination();
    changeActiveClassForNav('nav__list__book-btn');
    localStorageModule.write('group', currentGroup);
    const audioCard = new AudioCard();
    audioCard.listenClickOnListenBtn();
    studyCardModule.listenClickOnStudyBtn();
    difficultCardModule.listenClickOnDifficultBtn();
    this.hideGameButtons(+currentGroup);
    scrollBook.scroll();
    scrollBook.listenUpAndDownBtn();
  }

  private async renderBook(event: MouseEvent): Promise<void> {
    const targ = <HTMLButtonElement>event.target;
    if (targ.classList.contains('scroll-btn')) return;

    const group: number = bookController.getCurrentGroup(event);
    scrollBook.hideDownBtn(group);
    const data: AggregatedWord[] = await bookController.getGeneralWordArray(
      bookController.group,
      +MIN_PAGE_SIZE
    );
    this.createCard(data, String(bookController.group));
    this.setValuePageBookPage(MIN_PAGE_SIZE);
    this.checkMinMaxSizePageBookPage();
    this.showPagination(bookController.group);
    localStorageModule.write('group', bookController.group);
    localStorageModule.write('page', MIN_PAGE_SIZE);
    this.hideGameButtons(bookController.group);
    scrollBook.scroll();
    scrollBook.listenUpAndDownBtn();
  }

  private addListenerForGroup(event: MouseEvent): void {
    this.renderBook(event);
  }

  listenClickOnGroup(): void {
    listenClickOnBtn('group-selector', this.addListenerForGroup.bind(this));
  }
}

export default BookView;
