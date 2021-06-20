import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {GameManager} from "../manager/GameManager";
import {GameData} from "../data/GameData";

export function apiGetGameData(gameToken: string, playerToken: string, iteration: number): any {
  const resolvedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);
  const resolvedGame: GameToken | NullToken = TokenManager.get().getFromString(gameToken);

  if (resolvedPlayer.isNullToken() || resolvedGame.isNullToken()) {
    return "failed";
  }

  if (iteration == GameManager.get().getByToken(resolvedGame).getIteration()) {
    return "notChanged";
  }

  const result: string = GameData.convert(resolvedGame, <PlayerToken> resolvedPlayer);
  if (result === "failed") { // If statement doesn't add much for now, implemented for later expansion.
    return "failed";
  }
  return result;
}
