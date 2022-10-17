import BookView from '../book/book.view';
import { loginView } from '../auth/login.view';
import { registerView } from '../auth/register.view';
import localStorageModule from '../localStorage/localStorage';
import { Page, Routing } from '../types/routing';
import {
  addClassList,
  getGroupFromLocalStorage,
  getPageFromLocalStorage,
  listenClickOnBtn,
} from '../utils/general-functions';
import statisticView from '../statistics/statistic.view';
import sprintView from '../sprint/sprint.view';
import scrollBook from '../book/card/scroll.book';
import { NUMBER_FOR_CORRECT_REQUEST } from '../variables/general.variables';
import audioView from '../audiochallenge/audio.view';

export default class AppView {
  currentPage: string | undefined;

  render(): void {
    const pageRoutingObj = <Routing>localStorageModule.get('pageRoutingObj');
    const book: BookView = new BookView();
    const main = <HTMLElement>document.querySelector('.main');
    const currentGroupe: string = getGroupFromLocalStorage();
    const currentPage: string = getPageFromLocalStorage();
    document.onkeydown = null;
    main.onclick = null;
    this.currentPage = currentPage;
    if (pageRoutingObj.page === this.currentPage) return;
    this.showFooter();
    switch (pageRoutingObj.page) {
      case Page.main:
        this.changeMain('#main-page');
        this.currentPage = Page.main;
        break;
      case Page.book:
        this.changeMain('#book-page');
        book.renderCurrentPageBook(currentGroupe, currentPage);
        this.currentPage = Page.book;
        listenClickOnBtn('book-btn__audio-call', () => {
          localStorageModule.write<Routing>('pageRoutingObj', { page: Page.audioCallChosenDiff });
          this.render();
          scrollBook.removeWindowScrollListener();
        });

        listenClickOnBtn('book-btn__sprint', () => {
          localStorageModule.write<Routing>('pageRoutingObj', { page: Page.sprintChosenDiff });
          this.render();
          scrollBook.removeWindowScrollListener();
        });
        break;
      case Page.sprint:
        this.showFooter(false);
        sprintView.render(main);
        this.currentPage = Page.sprint;
        localStorageModule.write<Routing>('pageRoutingObj', { page: Page.sprint });
        break;
      case Page.sprintChosenDiff:
        this.showFooter(false);
        main.innerHTML = '';
        sprintView.render(main, {
          group: +currentGroupe - NUMBER_FOR_CORRECT_REQUEST,
          page: +currentPage - NUMBER_FOR_CORRECT_REQUEST,
        });
        this.currentPage = Page.sprint;
        localStorageModule.write<Routing>('pageRoutingObj', { page: Page.sprint });
        break;
      case Page.audioCall:
        this.showFooter(false);
        main.innerHTML = '';
        audioView.render(main);
        this.currentPage = Page.audioCall;
        break;
      case Page.audioCallChosenDiff:
        this.showFooter(false);
        main.innerHTML = '';
        audioView.render(main, {
          group: +currentGroupe - NUMBER_FOR_CORRECT_REQUEST,
          page: +currentPage - NUMBER_FOR_CORRECT_REQUEST,
        });
        this.currentPage = Page.audioCall;
        localStorageModule.write<Routing>('pageRoutingObj', { page: Page.audioCall });
        break;
      case Page.login:
        main.innerHTML = '';
        loginView.render(main);
        this.currentPage = Page.login;
        break;
      case Page.register:
        main.innerHTML = '';
        registerView.render(main);
        this.currentPage = Page.register;
        break;
      case Page.statistic:
        main.innerHTML = '';
        statisticView.render(main);
        this.currentPage = Page.statistic;
        addClassList('nav__list__statistics-btn', 'active');
        break;
      default:
        this.currentPage = Page.main;
        this.changeMain('#main-page');
        break;
    }
  }

  private showFooter(show = true): void {
    const footer = <HTMLElement>document.querySelector('footer.footer');
    if (show) {
      footer.classList.remove('not-active');
    } else {
      footer.classList.add('not-active');
    }
  }

  changeMain(templateId: string): void {
    const mainPageContent = <HTMLTemplateElement>document.querySelector(templateId);
    const main = <HTMLElement>document.querySelector('.main');
    main.innerHTML = '';
    main.append(mainPageContent.content.cloneNode(true));
  }
}

export const appView = new AppView();
