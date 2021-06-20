import {TokenManager} from "../../manager/TokenManager";
import {NullToken} from "../../model/NullToken";
import {AuthErrorResponse, AuthSuccessResponse} from "../responses/AuthResponse";
import {PlayerToken} from "../../model/PlayerToken";
import {GameToken} from "../../model/GameToken";
import {Director} from "../../manager/Director";
import {getLogger} from "../../endpoint";

export class AuthValidator {
  public static ValidatePlayer(playerToken: string, uuid: string): AuthErrorResponse | AuthSuccessResponse {

    const supposedPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(playerToken);

    if (supposedPlayer.isNullToken()) {
      getLogger().warn("supposedPlayer is null " + supposedPlayer.getToken());
      return AuthErrorResponse.UNKNOWN_TOKEN;
    }
    if ((<PlayerToken> supposedPlayer).getUUID() !== uuid) {
      return AuthErrorResponse.WRONG_UUID;
    }
    return new AuthSuccessResponse();
  }

  public static ValidateGame(gameToken: string): AuthErrorResponse | AuthSuccessResponse {
    const supposedGame: GameToken | NullToken = TokenManager.get().getFromString(gameToken);
    if (supposedGame.isNullToken()) {
      return AuthErrorResponse.UNKNOWN_TOKEN;
    }
    return new AuthSuccessResponse();
  }

  public static ValidatePlayerInGame(gameToken: GameToken, playerToken: PlayerToken): AuthErrorResponse | AuthSuccessResponse {
    if (Director.get().checkIfPlayerInGame(playerToken, gameToken) === undefined) {
      return AuthErrorResponse.NOT_IN_GAME;
    }
    return new AuthSuccessResponse();
  }
}
