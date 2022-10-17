import { listenClickOnBtn } from '../../utils/general-functions';
import wordController from '../../words/word.controller';
import BookView from '../book.view';
import difficultCardModule from './card.difficult';

class StudyCard {
  private async addExploreWord(id: string): Promise<void> {
    const difficultBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-difficult[data-id="${id}"]`));
    const studyBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-explore[data-id="${id}"]`));
    const bookView: BookView = new BookView();
    const group: string = BookView.getCurrentGroup();

    if (difficultBtn.classList.contains('active')) {
      await wordController.markAsNormal(id);
      difficultBtn.classList.remove('active');
      await wordController.markAsSolved(id);
      difficultCardModule.deleteCardFromDifficultGroup(id);
      studyBtn.classList.add('active');
      bookView.hideGameButtons(+group);
    } else {
      await wordController.markAsSolved(id);
      studyBtn.classList.add('active');
      bookView.hideGameButtons(+group);
    }
  }

  private async deleteExploreWord(id: string): Promise<void> {
    const bookView: BookView = new BookView();
    const studyBtn = <HTMLButtonElement>(document.querySelector(`.book__btn-explore[data-id="${id}"]`));
    const group: string = BookView.getCurrentGroup();

    await wordController.markAsNormal(id);
    studyBtn.classList.remove('active');
    bookView.hideGameButtons(+group);
  }

  private exploreStudyBtn(event: MouseEvent): void {
    const targ = <HTMLButtonElement>event.target;
    if (
      (targ.classList.contains('book__btn-explore') && !targ.classList.contains('active'))
      || (targ.parentElement?.classList.contains('book__btn-explore')
      && !targ.parentElement?.classList.contains('active'))
    ) {
      const id = <string>targ.getAttribute('data-id');
      this.addExploreWord(id);
    } else if (
      targ.classList.contains('book__btn-explore') || targ.parentElement?.classList.contains('book__btn-explore')
    ) {
      const id = <string>targ.getAttribute('data-id');
      this.deleteExploreWord(id);
    }
  }

  private addListenerForStudyCards(event: MouseEvent): void {
    this.exploreStudyBtn(event);
  }

  listenClickOnStudyBtn(): void {
    listenClickOnBtn('book-page__wrap-card', this.addListenerForStudyCards.bind(this));
  }
}

const studyCardModule = new StudyCard();

export default studyCardModule;
