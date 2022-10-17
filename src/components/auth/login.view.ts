import { appView } from '../app/app.view';
import errorController from '../error/error.controller';
import localStorageModule from '../localStorage/localStorage';
import { FormPayload } from '../types/http.types';
import { Routing } from '../types/routing';
import authController from './auth.controller';
import FormController from './form.controller';

export class LoginView {
  template: HTMLTemplateElement;
  formController: FormController;
  form: HTMLFormElement;

  constructor() {
    this.template = <HTMLTemplateElement>document.querySelector('template#login-page');
    this.form = <HTMLFormElement> this.template.content.querySelector('form');
    this.formController = new FormController(this.form, this.signInAction.bind(this));
  }

  private async signInAction(payload: FormPayload): Promise<void> {
    const { email = '', password = '' } = payload;
    this.formController.disable();
    errorController.clear('login');
    authController.signIn({ email, password }).then((result) => {
      this.formController.disable();
      this.renderErrors();
      return result;
    });
  }

  render(node: HTMLElement): void {
    const container = <DocumentFragment> this.template.content.cloneNode(true);
    this.form = <HTMLFormElement> container.querySelector('form');
    const redirect = <HTMLButtonElement>container.querySelector('.auth__form-button-alt');
    redirect.onclick = () => {
      const navigation = redirect.dataset.redirect;
      if (navigation) {
        localStorageModule.write<Routing>('pageRoutingObj', { page: navigation });
        appView.render();
      }
    };
    node.append(container);
    this.formController.forceUpdate(this.form);
  }

  private renderErrors(): void {
    if (!errorController.has('login')) return;
    const errors: string[] = errorController.get('login');
    const errorCont = this.form.parentElement?.querySelector('.auth__form-errors');
    if (errorCont) errorCont.textContent = errors.join(' ');
  }
}

export const loginView = new LoginView();
