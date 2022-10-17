import localStorageModule from '../localStorage/localStorage';
import { FIRST_GROUP, MIN_PAGE_SIZE } from '../variables/general.variables';

export function removeClassesWhenCloseBurgerMenu(): void {
  const wrapBurgerMenu = <HTMLDivElement>document.querySelector('.header__wrap-nav');
  const overlay = <HTMLDivElement>document.querySelector('.header__overlay');
  const burgerMenu = <HTMLDivElement>document.querySelector('.header__burger-menu');

  wrapBurgerMenu.classList.remove('open');
  overlay.classList.remove('active');
  burgerMenu.classList.remove('active');
}

export function listenClickOnBtn(
  tagClassName: string,
  callback: (e: MouseEvent) => void
): void | Promise<void> {
  const element = <HTMLElement>document.querySelector(`.${tagClassName}`);
  element.addEventListener('click', callback);
}

export function addClassList(tagClassName: string, className: string): void {
  const element = <HTMLElement>document.querySelector(`.${tagClassName}`);
  element.classList.add(`${className}`);
}

export function removeClassList(tagClassName: string, className: string): void {
  const element = <HTMLElement>document.querySelector(`.${tagClassName}`);
  element.classList.remove(`${className}`);
}

export function removeClassListForElements(tagClassName: string, className: string): void {
  const arrElements = <NodeListOf<Element>>document.querySelectorAll(`.${tagClassName}`);
  arrElements.forEach((el) => {
    el.classList.remove(`${className}`);
  });
}

export function addClassListForElements(tagClassName: string, className: string): void {
  const arrElements = <NodeListOf<Element>>document.querySelectorAll(`.${tagClassName}`);
  arrElements.forEach((el) => {
    el.classList.add(`${className}`);
  });
}

export function getPageFromLocalStorage(): string {
  const page = localStorageModule.get('page');
  if (page) {
    return page;
  }

  return MIN_PAGE_SIZE;
}

export function getGroupFromLocalStorage(): string {
  const group = localStorageModule.get('group');
  if (group) {
    return group;
  }

  return FIRST_GROUP;
}

export function changeActiveClassForNav(tagClassName: string): void {
  removeClassListForElements('nav__btn', 'active');
  addClassList(tagClassName, 'active');
}

export function randomNumberInRange({ min = 0, max }: { min?: number, max: number }): number {
  return min + Math.floor(Math.random() * (max - min));
}
