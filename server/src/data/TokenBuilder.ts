import {PlayerToken} from "../model/PlayerToken";
import {GameToken} from "../model/GameToken";
import {NullToken} from "../model/NullToken";

export class TokenBuilder {

  private token: string;

  constructor() {
    this.token = "";
  }

  public setToken(token: string): TokenBuilder {
    this.token = token;
    return this;
  }

  public forPlayer(): PlayerToken {
    return new PlayerToken(this.token);
  }

  public forGame(): GameToken {
    return new GameToken(this.token);
  }

  public static nullToken(): NullToken {
    return new NullToken();
  }

}
