class LocalStorage {
  write<Type>(key: string, value: Type): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  get<Type = string>(key: string): Type | null {
    const value = localStorage.getItem(key);
    if (value) return <Type>JSON.parse(value);
    return null;
  }
}

const localStorageModule = new LocalStorage();
export default localStorageModule;
