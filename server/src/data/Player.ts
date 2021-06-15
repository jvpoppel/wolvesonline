import {TokenBuilder} from "./TokenBuilder";
import {Token} from "../model/Token";
import {PlayerToken} from "../model/PlayerToken";

export class Player {

  private token: Token;
  private name: string;

  constructor() {
    this.token = TokenBuilder.nullToken();
    this.name = "Player";
  }

  public getName(): string {
    return this.name;
  }

  public getToken(): PlayerToken {
    return this.token;
  }

  public setName(name: string): Player {
    this.name = name;
    return this;
  }

  public setToken(token: PlayerToken): Player {
    this.token = token;
    return this;
  }
}
