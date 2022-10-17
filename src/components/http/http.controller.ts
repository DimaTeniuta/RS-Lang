import errorController from '../error/error.controller';
import {
  AggregatedWord,
  AggregatedWordsInfo,
  Auth,
  FormPayload,
  Refresh,
  Setting,
  Statistic,
  User,
  UserWord,
  Word,
} from '../types/http.types';

class HttpController {
  baseUrl: string;
  headers: FormPayload = {
    'Content-Type': 'application/json',
  };

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async getWords(group = <number>0, page = <number>0): Promise<Word[]> {
    const URL = `${this.baseUrl}/words?group=${group}&page=${page}`;
    const data: Promise<Word[]> = await fetch(URL).then((res) => res.json());

    return data;
  }

  async getWordById(id: string): Promise<Word | void> {
    const URL = `${this.baseUrl}/words/${id}`;
    const data: Word | void = await fetch(URL)
      .then((res) => {
        if (res.status === 404) throw new Error('Слово не найдено');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('word', error.message);
      });
    return data;
  }

  async createUser(user: User): Promise<User | void> {
    errorController.clear('register');
    const URL = `${this.baseUrl}/users`;
    const data: User | void = await fetch(URL, {
      body: JSON.stringify(user),
      headers: {
        ...this.headers,
      },
      method: 'POST',
    })
      .then((res) => {
        if (res.status === 417) throw new Error('Данный email уже используется');
        if (res.status === 422) throw new Error('Некорректный email или пароль');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('register', error.message);
      });

    return data;
  }

  async getUserById(id: string, token: string): Promise<User | void> {
    const URL = `${this.baseUrl}/users/${id}`;
    const data: void | User = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('user', error.message);
      });

    return data;
  }

  async deleteUser(id: string, token: string): Promise<string> {
    const URL = `${this.baseUrl}/users/${id}`;
    const data = <string> await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.text())
      .catch((error: Error) => {
        errorController.append('user', error.message);
      });

    return data;
  }

  async refreshTokens(id: string, token: string): Promise<Refresh | void> {
    const URL = `${this.baseUrl}/users/${id}/tokens`;
    const data: Refresh | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Токен невалиден');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('user', error.message);
      });

    return data;
  }

  async getUserWords(id: string, token: string): Promise<UserWord[] | void> {
    const URL = `${this.baseUrl}/users/${id}/words`;
    const data: UserWord[] | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('userWords', error.message);
      });
    return data;
  }

  async createUserWord(
    userId: string,
    wordId: string,
    word: UserWord,
    token: string
  ): Promise<UserWord | void> {
    const URL = `${this.baseUrl}/users/${userId}/words/${wordId}`;
    const data: UserWord | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      method: 'POST',
      body: JSON.stringify(word),
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('userWords', error.message);
      });

    return data;
  }

  async updateUserWord(
    userId: string,
    wordId: string,
    word: UserWord,
    token: string
  ): Promise<void | UserWord> {
    const URL = `${this.baseUrl}/users/${userId}/words/${wordId}`;
    const data: UserWord | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      method: 'PUT',
      body: JSON.stringify(word),
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь или слово не найдено');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('userWords', error.message);
      });

    return data;
  }

  async getUserWord(userId: string, wordId: string, token: string): Promise<void | UserWord> {
    const URL = `${this.baseUrl}/users/${userId}/words/${wordId}`;
    const data: UserWord | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь или слово не найдено');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('userWords', error.message);
      });

    return data;
  }

  async getUserStatistic(id: string, token: string): Promise<Statistic | void> {
    const URL = `${this.baseUrl}/users/${id}/statistics`;
    const data: Statistic | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Статистика не найдена');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('statistic', error.message);
      });

    return data;
  }

  async updateUserStatistic(id: string, token: string, body: Statistic): Promise<Statistic | void> {
    const URL = `${this.baseUrl}/users/${id}/statistics`;
    const data: Statistic | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      method: 'PUT',
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('statistic', error.message);
      });

    return data;
  }

  async getUserSettings(id: string, token: string): Promise<Setting | void> {
    const URL = `${this.baseUrl}/users/${id}/settings`;
    const data: Setting | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('setting', error.message);
      });

    return data;
  }

  async updateUserSettings(id: string, token: string, body: Setting): Promise<Setting | void> {
    const URL = `${this.baseUrl}/users/${id}/settings`;
    const data: Setting | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
      method: 'PUT',
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Пользователь не авторизован');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('setting', error.message);
      });

    return data;
  }

  async signIn(body: { email: string; password: string }): Promise<Auth | void> {
    const URL = `${this.baseUrl}/signin`;
    const data: Auth | void = await fetch(URL, {
      headers: {
        ...this.headers,
      },
      method: 'POST',
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Неверный пароль или email');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('login', error.message);
      });

    return data;
  }

  async getAggregatedWords(
    id: string,
    token: string,
    group?: number,
    filter = <string>''
  ): Promise<AggregatedWordsInfo[] | void> {
    let groupQuery = '';
    if (group !== undefined) groupQuery = `&group=${group}`;
    const URL = `${this.baseUrl}/users/${id}/aggregatedWords?filter=${filter}&wordsPerPage=4000${groupQuery}}`;
    const data: AggregatedWordsInfo[] | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Нет доступа');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь не найден');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('userAggregated', error.message);
      });

    return data;
  }

  async getAggregatedWordById(
    id: string,
    token: string,
    wordId: string
  ): Promise<AggregatedWord | void> {
    const URL = `${this.baseUrl}/users/${id}/aggregatedWords/${wordId}`;
    const data: AggregatedWord | void = await fetch(URL, {
      headers: {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 403) throw new Error('Нет доступа');
        if (res.status === 401) throw new Error('Пользователь не авторизован');
        if (res.status === 404) throw new Error('Пользователь или слово не найдены');
        return res;
      })
      .then((res) => res.json())
      .catch((error: Error) => {
        errorController.append('userAggregated', error.message);
      });

    return data;
  }
}

const httpController = new HttpController('https://rslang-team-4-backend.herokuapp.com');

export default httpController;
