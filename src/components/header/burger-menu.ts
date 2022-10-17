import { listenClickOnBtn, removeClassesWhenCloseBurgerMenu } from '../utils/general-functions';

function moveBurgerMenu(): void {
  const wrapBurgerMenu = <HTMLDivElement>document.querySelector('.header__wrap-nav');
  const overlay = <HTMLDivElement>document.querySelector('.header__overlay');
  const burgerMenu = <HTMLDivElement>document.querySelector('.header__burger-menu');

  wrapBurgerMenu.classList.toggle('open');
  burgerMenu.classList.toggle('active');
  overlay.classList.toggle('active');
}

export function listenClickOnOverlay(): void {
  listenClickOnBtn('header__overlay', removeClassesWhenCloseBurgerMenu);
}

export function showBurgerMenu(): void {
  listenClickOnBtn('header__burger-menu', moveBurgerMenu);
}
