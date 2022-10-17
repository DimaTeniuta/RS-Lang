import authController from '../auth/auth.controller';

const headerExit = <HTMLElement>document.querySelector('.entry-list__exit');
const headerLogin = <HTMLElement>document.querySelector('.entry-list__entry');
const headerRegister = <HTMLElement>document.querySelector('.entry-list__registration');
headerExit.addEventListener('click', (e: MouseEvent) => {
  e.preventDefault();
  authController.logout();
});

export default function manageHeaderButtons(isAuthenticated: boolean): void {
  switch (isAuthenticated) {
    case true:
      headerExit.classList.add('active');
      headerLogin.classList.add('not-active');
      headerRegister.classList.add('not-active');
      break;
    default:
      headerExit.classList.remove('active');
      headerLogin.classList.remove('not-active');
      headerRegister.classList.remove('not-active');
      break;
  }
}
