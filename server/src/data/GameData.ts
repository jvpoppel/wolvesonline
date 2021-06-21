import {Game} from "./Game";
import {GameToken} from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {GameManager} from "../manager/GameManager";
import {PlayerManager} from "../manager/PlayerManager";
import {Player} from "./Player";
import {Director} from "../manager/Director";

export class GameData {

  /**
   * Method that converts a given game into a object representation.
   * Basically gives the frontend all data it needs for a certain player.
   * i.e. when a player has role Wolf, only they have to receive wolf-specific data. A player with role
   * Ziener does not need this, and should not be able to receive any data about the Wolf event
   *
   * Both Game and PlayerTokens should be valid.
   *
   * @param gameToken Game to be converted
   * @param playerToken Player calling the conversion
   * @returns "failed" iff game and/or playertokens are not valid. Else, stringified version of game data.
   */
  public static convert(gameToken: GameToken, playerToken: PlayerToken): any {
    const game: Game = GameManager.get().getByToken(gameToken);
    const player: Player = PlayerManager.get().getByToken(playerToken);
    const playersInGame: Set<PlayerToken> | undefined = Director.get().getPlayersInGame(gameToken);

    if (Director.get().checkIfPlayerInGame(playerToken, gameToken) === undefined) {
      return "failed";
    }
    if (playersInGame === undefined) {
      return "failed";
    }

    const playersInGameLST = Array.from(playersInGame);
    const playerNamesInGame: string[] = playersInGameLST.map(playerToken => PlayerManager.get().getByToken(playerToken).getName());
    const playerTokensInGame: string[] = playersInGameLST.map(playerToken => playerToken.getToken());
    const playerRolesInGame: string[] = playersInGameLST.map(queryToken =>
      Director.get().getRoleOfPlayerAsPlayer(PlayerManager.get().getByToken(queryToken), player));
    const playerAliveInGame: string[] = playersInGameLST.map(playerToken => PlayerManager.get().getByToken(playerToken).isAlive() + "");

    return {
      "status": "success",
      "gameToken": game.getToken().getToken(),
      "playerToken": player.getToken().getToken(),
      "host": game.getHost(),
      "iteration": game.getIteration(),
      "started": !game.playerCanJoin(),
      "finished": game.isFinished(),
      "playerTokens": playerTokensInGame,
      "playerNames": playerNamesInGame,
      "playerRoles": playerRolesInGame,
      "playersAliveInGame": playerAliveInGame,
      "role": player.getRole(),
      "roleDescription": player.getRole() + " TODO: Change to description",
      "alive": player.isAlive()
    };
  }
}
