import { GameToken } from "../model/GameToken";
import { TokenBuilder } from "./TokenBuilder";
import { Token } from "../model/Token";
import {Player} from "./Player";

enum GameState {
  OPEN_WAITFORPLAYERS = "OPEN_WAITFORPLAYERS",
  OPEN_INPROGRESS = "OPEN_INPROGRESS",
  RESOLVED_FINALIZE = "RESOLVED_FINALIZE",
  RESOLVED_WAITFORTOKENRELEASE = "RESOLVED_WAITFORTOKENRELEASE"
}

export class Game {

  private token: Token;
  private state: GameState;
  private iteration: number;
  private host: Player | undefined;
  private players: Array<Player>;

  constructor() {
    this.state = GameState.OPEN_WAITFORPLAYERS;
    this.token = TokenBuilder.nullToken();
    this.iteration = 0;
    this.host = undefined;
    this.players = [];
  }

  /* Below method should only be called from Director */
  public addPlayer(player: Player): boolean {
    if (this.players.includes(player)) {
      return false;
    }
    this.players.push(player);
    this.iteration ++;
    return true;
  }

  /* Below method should only be called from Director */
  public deletePlayer(player: Player): boolean {
    const indexOfPlayer: number = this.players.indexOf(player);
    if (indexOfPlayer < 0) {
      return false;
    }
    this.players.splice(indexOfPlayer, 1);
    this.iteration ++;
    return true;
  }

  public getHost(): string {
    if (this.host === undefined) {
      return "";
    } else {
      return this.host.getToken().getToken();
    }
  }

  public getIteration(): number {
    return this.iteration;
  }

  public getToken(): GameToken {
    return this.token;
  }

  public playerCanJoin(): boolean {
    return this.state == GameState.OPEN_WAITFORPLAYERS;
  }

  public setHost(host: Player): Game {
    this.host = host;
    this.iteration ++;
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
    this.iteration++;
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
