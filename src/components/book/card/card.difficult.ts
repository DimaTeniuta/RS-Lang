import { listenClickOnBtn } from '../../utils/general-functions';
import { VALUE_DIFFICULT_GROUP } from '../../variables/general.variables';
import wordController from '../../words/word.controller';
import BookView from '../book.view';

class DifficultCard {
  deleteCardFromDifficultGroup(id: string): void {
    const group: string = BookView.getCurrentGroup();
    if (+group === VALUE_DIFFICULT_GROUP) {
      const card = <HTMLDivElement>document.querySelector(`.book__card[data-card="${id}"]`);
      card.remove();
    }
  }

  private async addDifficultWord(id: string): Promise<void> {
    const difficultBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-difficult[data-id="${id}"]`));
    const studyBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-explore[data-id="${id}"]`));
    const bookView: BookView = new BookView();
    const group: string = BookView.getCurrentGroup();

    if (studyBtn.classList.contains('active')) {
      await wordController.markAsNormal(id);
      studyBtn.classList.remove('active');
      await wordController.markAsHard(id);
      difficultBtn.classList.add('active');
      bookView.hideGameButtons(+group);
    } else {
      await wordController.markAsHard(id);
      difficultBtn.classList.add('active');
      bookView.hideGameButtons(+group);
    }
  }

  private async deleteDifficultWord(id: string): Promise<void> {
    const difficultBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-difficult[data-id="${id}"]`));
    const bookView: BookView = new BookView();
    const group: string = BookView.getCurrentGroup();

    await wordController.markAsNormal(id);
    this.deleteCardFromDifficultGroup(id);
    difficultBtn.classList.remove('active');
    bookView.hideGameButtons(+group);
  }

  private exploreDifficultBtn(event: MouseEvent): void {
    const targ = <HTMLButtonElement>event.target;
    if (
      (targ.classList.contains('book__btn-difficult') && !targ.classList.contains('active'))
      || (targ.parentElement?.classList.contains('book__btn-difficult')
      && !targ.parentElement?.classList.contains('active'))
    ) {
      const id = <string>targ.getAttribute('data-id');
      this.addDifficultWord(id);
    } else if (
      targ.classList.contains('book__btn-difficult')
      || targ.parentElement?.classList.contains('book__btn-difficult')
    ) {
      const id = <string>targ.getAttribute('data-id');
      this.deleteDifficultWord(id);
    }
  }

  private addListenerForStudyCards(event: MouseEvent): void {
    this.exploreDifficultBtn(event);
  }

  listenClickOnDifficultBtn(): void {
    listenClickOnBtn('book-page__wrap-card', this.addListenerForStudyCards.bind(this));
  }
}

const difficultCardModule = new DifficultCard();

export default difficultCardModule;
