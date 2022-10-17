class ErrorController {
  errors: { [key: string]: string[] } = {};

  append(key: string, value: string): boolean {
    try {
      if (this.has(key)) {
        this.errors[key].push(value);
      } else {
        this.errors[key] = [value];
      }
      return true;
    } catch {
      return false;
    }
  }

  has(key: string): boolean {
    return Boolean(this.errors[key]);
  }

  clear(key: string): void {
    if (this.has(key)) delete this.errors[key];
  }

  get(key: string): string[] {
    if (!this.has(key)) return [];
    return this.errors[key];
  }
}

const errorController = new ErrorController();
export default errorController;
