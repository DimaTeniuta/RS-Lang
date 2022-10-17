import '../styles/auth.scss';
import { FormPayload } from '../types/http.types';

// Fully controls form from DOM.

export default class FormController {
  root: HTMLFormElement;
  payload: FormPayload = {};
  inputs: HTMLInputElement[] = [];
  buttons: HTMLButtonElement[] = [];
  onSubmit: (payload: FormPayload) => void = () => {};

  constructor(root: HTMLFormElement, onSubmit?: (payload: FormPayload) => void) {
    this.root = root;
    if (onSubmit) this.onSubmit = onSubmit;
  }

  // Handle inputs and save their values to payload
  private inputListener(ev: Event): void {
    const target = <HTMLInputElement>ev.target;
    this.payload[target.name] = target.value;
  }

  // Custom handler for submit
  private submitHandler(event: SubmitEvent): void {
    event.preventDefault();
    this.onSubmit(this.payload);
  }

  private createListeners(): void {
    this.inputs.forEach((input) => {
      input.addEventListener('input', this.inputListener.bind(this));
      const firstInput = () => {
        // eslint-disable-next-line no-param-reassign
        input.dataset.touched = 'true';
        input.removeEventListener('blur', firstInput);
      };
      input.addEventListener('blur', firstInput);
    });
    this.root.addEventListener('submit', this.submitHandler.bind(this));
  }

  disable(): void {
    this.inputs.forEach((input) => {
      const field = input;
      field.disabled = !field.disabled;
    });
    this.buttons.forEach((btn) => {
      const button = btn;
      button.disabled = !button.disabled;
    });
  }

  forceUpdate(root: HTMLFormElement): void {
    this.root = root;
    this.inputs = Array.from(this.root.querySelectorAll('input'));
    this.buttons = Array.from(this.root.querySelectorAll('button'));
    this.createListeners();
  }
}
