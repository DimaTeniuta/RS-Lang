import authController from '../auth/auth.controller';
import { listenClickOnOverlay, showBurgerMenu } from '../header/burger-menu';
import loader from '../loader/loader.view';
import localStorageModule from '../localStorage/localStorage';
import { Auth } from '../types/http.types';
import { Page, Routing } from '../types/routing';
import AppController from './app.controller';
import AppView from './app.view';

class App {
  appController: AppController;
  appView: AppView;

  constructor() {
    this.appView = new AppView();
    this.appController = new AppController(this.appView);
  }

  start(): void {
    const main = <HTMLElement>document.querySelector('.main');
    loader.render(main);
    const auth = localStorageModule.get<Auth>('auth');
    authController.refreshAuth(auth).then(() => {
      this.appController.init();
      this.appController.linkHandlers();
      authController.subscribe(() => {
        if (authController.isAuthenticated) {
          localStorageModule.write<Routing>('pageRoutingObj', { page: Page.main });
        }
        this.appView.currentPage = undefined;
        this.appView.render();
      });
    });

    showBurgerMenu();
    listenClickOnOverlay();
  }
}

const app = new App();
export default app;
