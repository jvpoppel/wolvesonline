export interface Token {
  token: string;
  type: TokenType;

  getToken(): string;

  toString(): string;
}

export enum TokenType {
  GAME,
  PLAYER,
  NULL
}
