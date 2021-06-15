import { GameManager } from "./GameManager";
import { Player } from "../data/Player";
import { Game } from "../data/Game";
import { PlayerManager } from "./PlayerManager";
import { GameToken } from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {TSMap} from "typescript-map";

export class Director {

  private static instance: Director;

  private playersInGame: TSMap<GameToken, Set<PlayerToken>>;

  private constructor() {
    this.playersInGame = new TSMap<GameToken, Set<PlayerToken>>();
  }

  public static get(): Director {
    if (!Director.instance) {
      Director.instance = new Director();
    }
    return Director.instance;
  }

  /**
   * Creates game and player, returns Stringified version
   */
  public createGameForPlayer(): string {
    const createdGame: Game = GameManager.get().create();
    const createdPlayer: Player = PlayerManager.get().create();

    this.playersInGame.set(createdGame.getToken(), new Set<PlayerToken>().add(createdPlayer.getToken()));

    return JSON.stringify({
      "game": createdGame.getToken().getToken(),
      "player": createdPlayer.getToken().getToken()
    });
  }

  public joinGameForPlayer(gameToken: GameToken): string | undefined {
    const newPlayer: Player = PlayerManager.get().create();
    if (GameManager.get().getByToken(gameToken).addPlayer(newPlayer)) {
      return JSON.stringify({"player": newPlayer.getToken().getToken()});
    }
    return undefined;
  }

  /**
   * Method used for checking if player is in a game.
   * Use case: Player re-opens or refreshes browser.
   *
   * @param playerToken Player token from local storage
   * @param gameToken Game token from local storage
   */
  public checkIfPlayerInGame(playerToken: PlayerToken, gameToken: GameToken): GameToken | undefined {
    if (!this.playersInGame.has(gameToken)) {
      return undefined;
    }
    const players: Set<PlayerToken> = this.playersInGame.get(gameToken);
    if (!players.has(playerToken)) {
      return undefined;
    }

    return gameToken;
  }
}
