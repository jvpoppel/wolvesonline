import { GameToken } from "../model/GameToken";
import { TokenBuilder } from "./TokenBuilder";
import { Token } from "../model/Token";

enum GameState {
  OPEN_WAITFORPLAYERS = "OPEN_WAITFORPLAYERS",
  OPEN_INPROGRESS = "OPEN_INPROGRESS",
  RESOLVED_FINALIZE = "RESOLVED_FINALIZE",
  RESOLVED_WAITFORTOKENRELEASE = "RESOLVED_WAITFORTOKENRELEASE"
}

export class Game {

  private token: Token;
  private state: GameState;
  private host: string;

  constructor() {
    this.state = GameState.OPEN_WAITFORPLAYERS;
    this.token = TokenBuilder.nullToken();
    this.host = "";
  }

  public getToken(): GameToken {
    return this.token;
  }

  public playerCanJoin(): boolean {
    return !(this.state == GameState.OPEN_WAITFORPLAYERS);
  }

  public setHost(host: string): Game {
    this.host = host;
    return this;
  }

  public setToken(token: GameToken): Game {
    this.token = token;
    return this;
  }

  public start(): boolean {
    if (this.state != GameState.OPEN_WAITFORPLAYERS) {
      return false;
    }
    this.state = GameState.OPEN_INPROGRESS;
    return true;
  }

  public getState(): GameState {
    return this.state;
  }

  public finish(): Game {
    this.state = GameState.RESOLVED_FINALIZE;
    return this;
  }
}
