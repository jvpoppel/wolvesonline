import {TokenBuilder} from "./TokenBuilder";
import {Token} from "../model/Token";
import {PlayerToken} from "../model/PlayerToken";
import {GameRole} from "../model/GameRole";

export class Player {

  private token: Token;
  private name: string;
  private role: GameRole;
  private alive: boolean;

  constructor() {
    this.token = TokenBuilder.nullToken();
    this.name = "Player";
    this.role = GameRole.UNDECIDED;
    this.alive = true;
  }

  public getName(): string {
    return this.name;
  }

  public getRole(): GameRole {
    return this.role;
  }

  public getToken(): PlayerToken {
    return this.token;
  }

  public setName(name: string): Player {
    this.name = name;
    return this;
  }

  public setRole(role: GameRole): Player {
    this.role = role;
    return this;
  }

  public setToken(token: PlayerToken): Player {
    this.token = token;
    return this;
  }

}
