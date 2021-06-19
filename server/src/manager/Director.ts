import { GameManager } from "./GameManager";
import { Player } from "../data/Player";
import { Game } from "../data/Game";
import { PlayerManager } from "./PlayerManager";
import { GameToken } from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {TSMap} from "typescript-map";
import {getLogger} from "../endpoint";

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

  private isPlayerInGame(playerToken: PlayerToken, gameToken: GameToken): boolean {
    if (!this.playersInGame.has(gameToken)) {
      getLogger().info("Director does not have game " + gameToken.getToken());
      return false;
    }
    const players: Set<PlayerToken> = this.playersInGame.get(gameToken);
    if (!players.has(playerToken)) {
      getLogger().info("Director does not have player " + playerToken.getToken() + " in game " + gameToken.getToken());
      return false;
    }
    return true;
  }

  /**
   * Creates game and player, returns data object
   */
  public createGameForPlayer(playerName: string): TSMap<string, string> {
    const createdGame: Game = GameManager.get().create();
    const createdPlayer: Player = PlayerManager.get().create();
    createdPlayer.setName(playerName);
    createdGame.setHost(createdPlayer);

    getLogger().debug("[Director] Created game " + createdGame.getToken().getToken()
      + " for player " + createdPlayer.getToken().getToken());

    this.playersInGame.set(createdGame.getToken(), new Set<PlayerToken>().add(createdPlayer.getToken()));

    return new TSMap<string, string>().set("playerToken", createdPlayer.getToken().getToken())
      .set("gameToken", createdGame.getToken().getToken());
  }

  public joinGameForPlayer(gameToken: GameToken, playerName: string): string | undefined {
    const newPlayer: Player = PlayerManager.get().create();
    newPlayer.setName(playerName);
    if (GameManager.get().getByToken(gameToken).addPlayer(newPlayer)) {
      this.playersInGame.get(gameToken).add(newPlayer.getToken());
      getLogger().debug("[Director] Added player " + newPlayer.getToken().getToken() + " to game " + gameToken.getToken());
      return JSON.stringify({"player": newPlayer.getToken().getToken()});
    }
    getLogger().debug("[Director] Could not add player to game " + gameToken.getToken());
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
    if (!this.isPlayerInGame(playerToken, gameToken)) {
      return undefined;
    }

    return gameToken;
  }

  public getPlayersInGame(gameToken: GameToken): Set<PlayerToken> | undefined {
    if (!this.playersInGame.has(gameToken)) {
      getLogger().info("Director does not have game " + gameToken.getToken());
      return undefined;
    }

    return this.playersInGame.get(gameToken);
  }

  public kickPlayerFromGame(playerToken: PlayerToken, gameToken: GameToken): boolean | undefined {
    getLogger().debug("[Director] Attempting to kick player " + playerToken.getToken() + " from game " + gameToken.getToken());
    if (!this.isPlayerInGame(playerToken, gameToken)) {
      getLogger().debug("[Director] Could not kick player " + playerToken.getToken() + " from game " + gameToken.getToken() + ": Player not in game.");
      return undefined;
    }

    // Player is in game, remove from PlayerManager & PlayersInGame
    GameManager.get().getByToken(gameToken).deletePlayer(PlayerManager.get().getByToken(playerToken));
    PlayerManager.get().deleteByToken(playerToken);
    this.playersInGame.get(gameToken).delete(playerToken);
    return true;
  }
}
