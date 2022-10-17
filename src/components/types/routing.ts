export interface Routing {
  page: string;
  difficulty?: string;
}

export enum Page {
  main = 'main',
  sprint = 'sprint',
  audioCall = 'audioCall',
  book = 'book',
  register = 'register',
  login = 'login',
  statistic = 'statistic',
  sprintChosenDiff = 'sprint-chosen-diff',
  audioCallChosenDiff = 'audioCall-chosen-diff'
}
