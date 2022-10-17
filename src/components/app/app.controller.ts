/* eslint-disable consistent-return */
import scrollBook from '../book/card/scroll.book';
import localStorageModule from '../localStorage/localStorage';
import { Page, Routing } from '../types/routing';
import {
  listenClickOnBtn,
  removeClassListForElements,
  removeClassesWhenCloseBurgerMenu,
  changeActiveClassForNav,
} from '../utils/general-functions';

import AppView from './app.view';

export default class AppController {
  view: AppView;

  constructor(appView: AppView) {
    this.view = appView;
  }

  init(): void {
    const pageRoutingObj = localStorageModule.get<Routing>('pageRoutingObj');
    if (pageRoutingObj === null) {
      this.view.changeMain('#main-page');
      localStorageModule.write('pageRoutingObj', { page: Page.main });
    }

    this.view.render();
  }

  routeMain(): void {
    localStorageModule.write('pageRoutingObj', { page: Page.main });
    this.view.render();
  }

  linkHandlers(): void {
    listenClickOnBtn('header__logo__text', () => {
      localStorageModule.write('pageRoutingObj', { page: Page.main });
      this.view.render();
      removeClassListForElements('nav__btn', 'active');
      scrollBook.removeWindowScrollListener();
    });

    listenClickOnBtn('nav__list__book-btn', () => {
      const bookBtn = <HTMLButtonElement>document.querySelector('.nav__list__book-btn');
      if (!bookBtn.classList.contains('active')) {
        const pageRoutingObj = <Routing>localStorageModule.get('pageRoutingObj');
        pageRoutingObj.page = Page.book;
        localStorageModule.write('pageRoutingObj', pageRoutingObj);
        this.view.render();
      }
    });

    listenClickOnBtn('nav__list__audio-call-btn', (event: MouseEvent) => {
      const targ = <HTMLButtonElement>event.target;
      if (!targ.classList.contains('active')) {
        const pageRoutingObj = <Routing>localStorageModule.get('pageRoutingObj');
        pageRoutingObj.page = Page.audioCall;
        localStorageModule.write<Routing>('pageRoutingObj', pageRoutingObj);
        this.view.render();
        removeClassesWhenCloseBurgerMenu();
        scrollBook.removeWindowScrollListener();
      }
    });

    listenClickOnBtn('nav__list__sprint-btn', (event: MouseEvent) => {
      const targ = <HTMLButtonElement>event.target;
      if (!targ.classList.contains('active')) {
        const pageRoutingObj = <Routing>localStorageModule.get('pageRoutingObj');
        pageRoutingObj.page = Page.sprint;
        localStorageModule.write('pageRoutingObj', pageRoutingObj);
        scrollBook.removeWindowScrollListener();
        removeClassesWhenCloseBurgerMenu();
        this.view.render();
        changeActiveClassForNav('nav__list__sprint-btn');
      }
    });

    listenClickOnBtn('entry-list__entry', () => {
      localStorageModule.write('pageRoutingObj', { page: Page.login });
      removeClassesWhenCloseBurgerMenu();
      this.view.render();
      removeClassListForElements('nav__btn', 'active');
      scrollBook.removeWindowScrollListener();
    });

    listenClickOnBtn('entry-list__registration', () => {
      localStorageModule.write('pageRoutingObj', { page: Page.register });
      removeClassesWhenCloseBurgerMenu();
      this.view.render();
      removeClassListForElements('nav__btn', 'active');
      scrollBook.removeWindowScrollListener();
    });

    listenClickOnBtn('nav__list__statistics-btn', () => {
      localStorageModule.write('pageRoutingObj', { page: Page.statistic });
      removeClassesWhenCloseBurgerMenu();
      this.view.render();
      changeActiveClassForNav('nav__list__statistics-btn');
      scrollBook.removeWindowScrollListener();
    });
  }
}
