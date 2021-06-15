import {GameToken} from "../model/GameToken";
import {TokenManager} from "../manager/TokenManager";
import {Token} from "../model/Token";
import {PlayerToken} from "../model/PlayerToken";
import {Director} from "../manager/Director";

export function apiReconnectGame(playerToken: string, gameToken: string): string | undefined {

  const resolvedPlayerToken: Token = TokenManager.get().getFromString(playerToken);
  const resolvedGameToken: Token = TokenManager.get().getFromString(gameToken);
  if (!(resolvedPlayerToken instanceof PlayerToken)) {
    return undefined; // No player on given token
  }
  if (!(resolvedGameToken instanceof GameToken)) {
    return undefined; // No game on given token
  }

  const toReturn: GameToken | undefined = Director.get().checkIfPlayerInGame(resolvedPlayerToken, resolvedGameToken);
  if (toReturn == undefined) {
    return undefined;
  }
  return toReturn.getToken();
}
