import {GameManager} from "../manager/GameManager";
import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {Game} from "../data/Game";

export function apiStartGame(givenToken: string): boolean {

  const gameToken: Token = TokenManager.get().getFromString(givenToken);
  if (!(gameToken instanceof GameToken)) {
    return false; // No game on given token
  }
  const game: Game = GameManager.get().getByToken(gameToken);

  const gameStarted: boolean = game.start();
  if (!gameStarted) {
    return false; // Game not started, might be already in progress
  }
  return true;
}
