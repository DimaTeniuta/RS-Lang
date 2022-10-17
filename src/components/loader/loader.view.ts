class LoaderView {
  template: HTMLTemplateElement;

  constructor() {
    this.template = <HTMLTemplateElement>document.querySelector('#loader');
  }

  render(node: HTMLElement): void {
    node.append(this.template.content.cloneNode(true));
  }
}

const loader = new LoaderView();

export default loader;
