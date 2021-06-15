import {Token, TokenType} from "./Token";

export class PlayerToken implements Token {
  token: string;
  type: TokenType;

  constructor(token: string) {
    this.token = token;
    this.type = TokenType.PLAYER;
  }

  public getToken(): string {
    return this.token;
  }

  public toString(): string {
    return this.token;
  }

}
