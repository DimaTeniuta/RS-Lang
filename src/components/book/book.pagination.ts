import localStorageModule from '../localStorage/localStorage';
import { PaginationBtn } from '../types/book';
import { AggregatedWord } from '../types/http.types';
import { listenClickOnBtn } from '../utils/general-functions';
import {
  FIRST_GROUP,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  NUMBER_FOR_CORRECT_REQUEST,
} from '../variables/general.variables';
import bookController from './book.controller';
import BookView from './book.view';
import scrollBook from './card/scroll.book';

class BookPagination {
  btn: string;
  bookView: BookView;
  nextPage: number;

  constructor() {
    this.btn = '';
    this.nextPage = bookController.page;
    this.bookView = new BookView();
  }

  private checkActiveBtn(event: MouseEvent): string {
    const targ = <HTMLButtonElement>event.target;

    if (targ.classList.contains('pagination-btn') && !targ.classList.contains('not-active')) {
      const valueDataAtr = <string>targ.getAttribute('data-pagination');

      if (valueDataAtr === PaginationBtn.START) {
        this.btn = PaginationBtn.START;
      } else if (valueDataAtr === PaginationBtn.PREV) {
        this.btn = PaginationBtn.PREV;
      } else if (valueDataAtr === PaginationBtn.NEXT) {
        this.btn = PaginationBtn.NEXT;
      } else if (valueDataAtr === PaginationBtn.FINISH) {
        this.btn = PaginationBtn.FINISH;
      }
    }

    return this.btn;
  }

  private chooseValuesForNextPage(): number {
    bookController.getCurrentPage();

    if (this.btn === PaginationBtn.START) {
      this.nextPage = +MIN_PAGE_SIZE;
    } else if (this.btn === PaginationBtn.PREV) {
      this.nextPage = bookController.page - NUMBER_FOR_CORRECT_REQUEST;
    } else if (this.btn === PaginationBtn.NEXT) {
      this.nextPage = bookController.page + NUMBER_FOR_CORRECT_REQUEST;
    } else if (this.btn === PaginationBtn.FINISH) {
      this.nextPage = +MAX_PAGE_SIZE;
    }

    return this.nextPage;
  }

  private changeValuePage(): void {
    const page = <HTMLDivElement>document.querySelector('.book-pagination__number-page');
    const pageValue = <number>Number(<string>page.textContent);

    if (this.btn === PaginationBtn.START) {
      page.textContent = MIN_PAGE_SIZE;
    } else if (this.btn === PaginationBtn.PREV) {
      page.textContent = <string>String(pageValue - NUMBER_FOR_CORRECT_REQUEST);
    } else if (this.btn === PaginationBtn.NEXT) {
      page.textContent = <string>String(pageValue + NUMBER_FOR_CORRECT_REQUEST);
    } else if (this.btn === PaginationBtn.FINISH) {
      page.textContent = MAX_PAGE_SIZE;
    }

    localStorageModule.write('page', page.textContent);
  }

  private async changePage(event: MouseEvent): Promise<void> {
    this.checkActiveBtn(event);
    this.chooseValuesForNextPage();
    this.changeValuePage();
    this.bookView.checkMinMaxSizePageBookPage();
    const currentGroup: string | null = localStorageModule.get('group');
    let group = +FIRST_GROUP;

    if (currentGroup) {
      group = +currentGroup;
    }

    const array: AggregatedWord[] = await bookController.getGeneralWordArray(
      group,
      this.nextPage
    );

    this.bookView.createCard(array, String(group));
    const valueTop = document.documentElement.scrollHeight;
    scrollBook.windowScroll(valueTop);
  }

  private addListenerForPagination(event: MouseEvent): void {
    const targ = <HTMLButtonElement>event.target;
    if (targ.classList.contains('pagination-btn') && !targ.classList.contains('not-active')) {
      this.changePage(event);
    }
  }

  listenClickOnBtnPagination(): void {
    listenClickOnBtn('book-pagination__wrap', this.addListenerForPagination.bind(this));
  }
}

export default BookPagination;
