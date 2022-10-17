import { addClassList, listenClickOnBtn, removeClassList } from '../../utils/general-functions';
import { VALUE_DIFFICULT_GROUP } from '../../variables/general.variables';

class ScrollBook {
  private scrollBookPage(): void {
    const upBtn = <HTMLButtonElement>document.querySelector('.book-page__up-btn');
    const downBtn = <HTMLButtonElement>document.querySelector('.book-page__down-btn');
    const heightPage: number = document.documentElement.scrollHeight;
    const currentValueScrollPage: number = document.documentElement.scrollTop;
    const sizeWindow: number = document.documentElement.clientHeight;

    if (document.documentElement.scrollTop > sizeWindow) {
      upBtn.classList.remove('not-active');
    } else {
      upBtn.classList.add('not-active');
    }

    if (heightPage < currentValueScrollPage + sizeWindow + sizeWindow) {
      downBtn.classList.add('not-active');
    } else {
      downBtn.classList.remove('not-active');
    }
  }

  hideDownBtn(group: number): void {
    if (group === VALUE_DIFFICULT_GROUP) {
      addClassList('book-page__down-btn', 'not-active');
    } else {
      removeClassList('book-page__down-btn', 'not-active');
    }
  }

  removeWindowScrollListener(): void {
    window.removeEventListener('scroll', this.scrollBookPage);
  }

  scroll(): void {
    window.addEventListener('scroll', this.scrollBookPage);
  }

  windowScroll(value: number): void {
    window.scrollTo({
      top: value,
      behavior: 'smooth',
    });
  }

  private scrollUpAndDown(event: MouseEvent): void {
    const targ = <HTMLButtonElement>event.target;
    if (targ.classList.contains('scroll-btn') && !targ.classList.contains('not-active')) {
      let valueTop = 0;

      if (targ.classList.contains('book-page__down-btn')) {
        valueTop = document.documentElement.scrollHeight;
      }
      this.windowScroll(valueTop);
    }
  }

  listenUpAndDownBtn(): void {
    listenClickOnBtn('group-selector', this.scrollUpAndDown.bind(this));
  }
}

const scrollBook = new ScrollBook();

export default scrollBook;
