import {GameManager} from "../manager/GameManager";
import {Game} from "../data/Game";
import {TokenManager} from "../manager/TokenManager";
import {GameToken} from "../model/GameToken";
import {Player} from "../data/Player";
import {PlayerToken} from "../model/PlayerToken";
import {PlayerManager} from "../manager/PlayerManager";
import {NullToken} from "../model/NullToken";
import {InternalAPIReturns} from "./responses/InternalAPIReturns";
import {Director} from "../manager/Director";
import {GameRole} from "../model/GameRole";
import {SubState} from "../model/SubState";
import {Night} from "../data/Night";

export function apiMedium(gameToken: string, playerToken: string, onPlayer: string): { status: InternalAPIReturns } {
  // Tokens are validated by AuthValidation in endpoint.
  const resolvedGameToken: GameToken = <GameToken> TokenManager.get().getFromString(gameToken);
  const resolvedGame: Game = GameManager.get().getByToken(resolvedGameToken);
  const resolvedCallingPlayer: Player = PlayerManager.get().getByToken(<PlayerToken> TokenManager.get().getFromString(playerToken));

  // Check if calling player actually is the medium.
  if (resolvedCallingPlayer.getRole() !== GameRole.MEDIUM) {
    return { "status": InternalAPIReturns.UNAUTHORIZED };
  }

  // Check game state
  if (resolvedGame.getSubState() !== SubState.NIGHTTIME_MEDIUM) {
    return { "status": InternalAPIReturns.UNAUTHORIZED };
  }

  // onPlayer token not validated.
  const resolvedOnPlayerToken: PlayerToken | NullToken = TokenManager.get().getFromString(onPlayer);
  if (resolvedOnPlayerToken.isNullToken()) {
    return { "status": InternalAPIReturns.FAILED };
  }
  // We now know resolvedOnPlayer is actually a player, check if he is in game
  if (!Director.get().checkIfPlayerInGame(<PlayerToken> resolvedOnPlayerToken, resolvedGameToken)) {
    return { "status": InternalAPIReturns.FAILED };
  }

  // OnPlayer in game; set checked player in night to onPlayer.
  (<Night> resolvedGame.getNight()).setPlayerMediumChecked(PlayerManager.get().getByToken(<PlayerToken> resolvedOnPlayerToken));
  resolvedGame.setSubStateToNightSelection();
  return { "status": InternalAPIReturns.SUCCESS };
}
