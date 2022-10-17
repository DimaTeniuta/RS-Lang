import { appView } from '../app/app.view';
import errorController from '../error/error.controller';
import localStorageModule from '../localStorage/localStorage';
import { FormPayload } from '../types/http.types';
import { Routing } from '../types/routing';
import authController from './auth.controller';
import FormController from './form.controller';

export class RegisterView {
  template: HTMLTemplateElement;
  formController: FormController;
  form: HTMLFormElement;

  constructor() {
    this.template = <HTMLTemplateElement>document.querySelector('template#register-page');
    this.form = <HTMLFormElement> this.template.content.querySelector('form');
    this.formController = new FormController(this.form, this.registerAction.bind(this));
  }

  private async registerAction(payload: FormPayload): Promise<void> {
    const { email = '', password = '', name = '' } = payload;
    this.formController.disable();
    authController.register({ email, password, name }).then((result) => {
      this.formController.disable();
      this.renderErrors();
      if (result) {
        authController.signIn({ email, password });
      }
      return result;
    });
  }

  render(node: HTMLElement): void {
    const container = <DocumentFragment> this.template.content.cloneNode(true);
    this.form = <HTMLFormElement>container.querySelector('form');
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
    if (!errorController.has('register')) return;
    const errors: string[] = errorController.get('register');
    const errorCont = this.form.parentElement?.querySelector('.auth__form-errors');
    if (errorCont) errorCont.textContent = errors.join(' ');
  }
}

export const registerView = new RegisterView();
