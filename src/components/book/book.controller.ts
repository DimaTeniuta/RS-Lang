import authController from '../auth/auth.controller';
import { PageValue, PathBackgroundBook } from '../types/book';
import { AggregatedWord } from '../types/http.types';
import { addClassList, removeClassListForElements } from '../utils/general-functions';
import {
  NUMBER_FOR_CORRECT_REQUEST,
  VALUE_DIFFICULT_GROUP,
  VALUE_FOR_CALCULATE_RIGHT_PERCENT,
} from '../variables/general.variables';
import wordController from '../words/word.controller';

class BookController {
  page: number;
  group: number;

  constructor(page = 1, group = 1) {
    this.page = page;
    this.group = group;
  }

  checkAuthorizedUser(): boolean {
    return authController.isAuthenticated;
  }

  getCurrentGroup(event: MouseEvent): number {
    const targ = <HTMLButtonElement>event.target;

    if (targ.classList.contains('selector-list__group-btn')) {
      const valueGroup = <string>targ.getAttribute('data-group');
      this.group = +valueGroup;

      removeClassListForElements('selector-list__group-btn', 'active');
      addClassList(`selector-list__group-btn[data-group="${valueGroup}"]`, 'active');
    }

    return this.group;
  }

  calculateRightAnswers(correctAnswer: number, incorrectAnswer: number): number {
    const totalAmount: number = correctAnswer + incorrectAnswer;
    const result: number = (correctAnswer / totalAmount) * VALUE_FOR_CALCULATE_RIGHT_PERCENT;

    return result;
  }

  choosePathForBackgroundBook(group: number): string {
    switch (group) {
      case PageValue.ONE:
        return PathBackgroundBook.BACKGROUND_1;
        break;
      case PageValue.TWO:
        return PathBackgroundBook.BACKGROUND_2;
        break;
      case PageValue.THREE:
        return PathBackgroundBook.BACKGROUND_3;
        break;
      case PageValue.FOUR:
        return PathBackgroundBook.BACKGROUND_4;
        break;
      case PageValue.FIVE:
        return PathBackgroundBook.BACKGROUND_5;
        break;
      case PageValue.SIX:
        return PathBackgroundBook.BACKGROUND_6;
        break;
      default:
        return '';
        break;
    }
  }

  checkCompleatLearnPage(): boolean {
    const exploreBtns = <NodeListOf<Element>>document.querySelectorAll('.book__btn-explore');
    let result = <boolean>true;

    exploreBtns.forEach((el) => {
      if (!el.classList.contains('active')) {
        const id = <string>el.getAttribute('data-id');
        const difficultBtn = <HTMLButtonElement>(
          document.querySelector(`.book__btn-difficult[data-id="${id}"]`)
        );
        if (!difficultBtn.classList.contains('active')) {
          result = false;
        }
      }
    });

    return result;
  }

  checkParticipationInGames(element: AggregatedWord): boolean {
    if (element.userWord) {
      if (element.userWord.optional.correct > 0 || element.userWord.optional.incorrect > 0) {
        return true;
      }
    }

    return false;
  }

  getCurrentPage(): number {
    const page = <HTMLDivElement>document.querySelector('.book-pagination__number-page');
    this.page = +(<string>page.textContent);

    return this.page;
  }

  async getWordArray(group: number, page: number): Promise<AggregatedWord[]> {
    let data: AggregatedWord[];
    if (group === VALUE_DIFFICULT_GROUP) {
      data = await wordController.getHardWords();
    } else {
      data = await wordController.getWords(
        +group - NUMBER_FOR_CORRECT_REQUEST,
        +page - NUMBER_FOR_CORRECT_REQUEST
      );
    }

    return data;
  }

  checkDifficultGroupForNotAuthorizedUser(group: number): boolean {
    if (!this.checkAuthorizedUser() && group === VALUE_DIFFICULT_GROUP) {
      return true;
    }

    return false;
  }

  async getGeneralWordArray(group: number, page: number): Promise<AggregatedWord[]> {
    if (group === VALUE_DIFFICULT_GROUP) {
      const array: AggregatedWord[] | [] = await wordController.getHardWords();

      return array;
    }

    const arr: AggregatedWord[] = await wordController.getWords(
      group - NUMBER_FOR_CORRECT_REQUEST,
      page - NUMBER_FOR_CORRECT_REQUEST
    );

    return arr;
  }
}

const bookController: BookController = new BookController();
export default bookController;
