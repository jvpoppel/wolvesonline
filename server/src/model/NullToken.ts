import {Token, TokenType} from "./Token";

export class NullToken implements Token {

  constructor() {
    this.token = "";
    this.type = TokenType.NULL;
  }
  token: string;
  type: TokenType;

  getToken(): string {
    return "";
  }
}
