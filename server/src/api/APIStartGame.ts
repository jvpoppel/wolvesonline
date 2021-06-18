import {GameManager} from "../manager/GameManager";
import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {Game} from "../data/Game";
import {getLogger} from "../endpoint";

export function apiStartGame(givenToken: string): boolean {

  const gameToken: Token = TokenManager.get().getFromString(givenToken);
  if (!(gameToken instanceof GameToken)) {
    getLogger().debug("[APIStartGame] Given token " + givenToken + " is not a game token.");
    return false; // No game on given token
  }
  const game: Game = GameManager.get().getByToken(gameToken);

  const gameStarted: boolean = game.start();
  if (!gameStarted) {
    getLogger().debug("[APIStartGame] Game " + givenToken + " could not be started.");
    return false; // Game not started, might be already in progress
  }
  getLogger().info("[APIStartGame] Game " + givenToken + " has started.");
  return true;
}
