import manageHeaderButtons from '../header/header-login';
import httpController from '../http/http.controller';
import localStorageModule from '../localStorage/localStorage';
import { Auth, User } from '../types/http.types';

class AuthController {
  private subscribers: (() => void)[] = [];

  isAuthenticated = false;
  token = '';
  refreshToken = '';
  userId = '';
  name = '';

  async signIn(user: Omit<User, 'name'>): Promise<boolean> {
    const result = await httpController.signIn(user);
    if (result) {
      this.login(result);
      return true;
    }

    return false;
  }

  async register(user: User): Promise<boolean> {
    const result = await httpController.createUser(user);
    if (result) {
      return true;
    }

    return false;
  }

  private login(auth: Auth): void {
    const {
      userId, token, refreshToken, name
    } = auth;
    localStorageModule.write<Auth>('auth', auth);
    this.isAuthenticated = true;
    this.userId = userId;
    this.token = token;
    this.refreshToken = refreshToken;
    this.name = name;
    manageHeaderButtons(this.isAuthenticated);
    this.updateSubscribers();
  }

  logout(): void {
    this.isAuthenticated = false;
    this.token = '';
    this.userId = '';
    this.refreshToken = '';
    this.name = '';
    localStorageModule.write<string>('auth', '');
    manageHeaderButtons(this.isAuthenticated);
    this.updateSubscribers();
  }

  async refreshAuth(auth: Auth | null): Promise<boolean> {
    let userId: string; let refreshToken: string; let
      token: string;
    if (!auth) {
      userId = '';
      refreshToken = '';
      token = '';
    } else {
      ({ userId, refreshToken, token } = auth);
    }
    const res = await httpController.getUserById(userId, token);
    if (res && auth) {
      this.login({ ...auth });
      return true;
    } if (auth) {
      const result = await httpController.refreshTokens(userId, refreshToken);
      if (result) {
        this.login({ ...auth, ...result });
        return true;
      }
    }
    this.logout();
    return false;
  }

  subscribe(cb: () => void): void {
    this.subscribers.push(cb);
  }

  private updateSubscribers(): void {
    this.subscribers.forEach((cb) => cb());
  }
}

const authController = new AuthController();

export default authController;
