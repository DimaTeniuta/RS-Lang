/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import httpController from '../http/http.controller';
import { GameGenerator } from '../types/game.types';
import { AggregatedWord, Word } from '../types/http.types';
import { randomNumberInRange } from '../utils/general-functions';
import { NUMBER_FOR_CORRECT_REQUEST } from '../variables/general.variables';
import { PAGES_PER_GROUP, WORDS_PER_PAGE } from '../variables/word.variables';
import wordController from '../words/word.controller';

class GameController {
  async generateAccordingToGroup(group = 0, maxWords = 20): Promise<Word[]> {
    const randomPages = new Set<number>();
    const PAGE_NUMBER = 5;
    while (randomPages.size < PAGE_NUMBER) {
      randomPages.add(randomNumberInRange({ max: PAGES_PER_GROUP }));
    }
    let words: Word[] = [];
    for (const page of randomPages) {
      const response = await httpController.getWords(group, page);
      const randomIndex = Math.abs(
        randomNumberInRange({ max: WORDS_PER_PAGE }) - maxWords / PAGE_NUMBER
      );
      words = [...words, ...response.splice(randomIndex, maxWords / PAGE_NUMBER)];
    }

    return words;
  }

  async generateAccordingToPage(group = 0, page = 0, maxWords = 20): Promise<AggregatedWord[]> {
    let currentPage: number = page;
    let words: AggregatedWord[] = [];
    while (words.length < maxWords) {
      if (currentPage < 0) break;
      const response = await wordController.getNotSolved(group, currentPage);
      if (response) {
        words = [...words, ...response];
      }
      currentPage -= 1;
    }

    return words.splice(0, maxWords);
  }

  async getInfiniteByGroup(group = 0): Promise<GameGenerator> {
    const pages = [...new Array(20)].map((_, idx) => idx);
    const getNewWords = async () => {
      if (!pages.length) return [];
      const page = pages.splice(randomNumberInRange({ max: pages.length }), 1)[0];
      const words = await httpController.getWords(group, page);
      return words;
    };

    return {
      words: getNewWords(),
      getNew: getNewWords,
    };
  }

  async getInfiniteFromPage(group = 0, page = 0): Promise<GameGenerator> {
    let currentPage: number = page;
    const getNewWords = async () => {
      if (currentPage < 0) return [];
      const words = await wordController.getNotSolved(
        group, (
          currentPage -= NUMBER_FOR_CORRECT_REQUEST
        )
      );
      return words || [];
    };
    return {
      words: getNewWords(),
      getNew: getNewWords,
    };
  }
}
const gameController = new GameController();
export default gameController;
