import {Game} from "./Game";
import {GameToken} from "../model/GameToken";
import {PlayerToken} from "../model/PlayerToken";
import {GameManager} from "../manager/GameManager";
import {PlayerManager} from "../manager/PlayerManager";
import {Player} from "./Player";
import {Director} from "../manager/Director";
import {GameRole} from "../model/GameRole";
import {Night} from "./Night";
import {Vote} from "./Vote";
import {SubState} from "../model/SubState";

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

    let voteIteration = -1; // Iteration of games' vote, -1 if there is no vote
    if (game.getVote() != undefined) {
      voteIteration = <number> (<Vote> game.getVote()).getIteration();
    }

    // During voting, narrator always needs the latest game data. Thus; IFF subState = DAYTIME_VOTING, set narrator iteration = server iteration - 1
    // Thus always triggering a data update.
    let iteration = game.getIteration();
    if (game.getSubState() === SubState.DAYTIME_VOTING && player.getRole() === GameRole.NARRATOR) {
      // It might happen that the Host fetches JUST before the vote has begun. In this case, also let him fetch.
      if (game.getVote() === undefined) {
        iteration --;
      } else if ((<Vote> game.getVote()).getPlayersThatStillHaveToVote().length == 0) {
        // All players have voted; no continuous data fetching needed. This is last fetch.
      } else {
        // Not all players have voted, keep on fetching.
        iteration--;
      }
    }

    const generalGameData: any = {
      "status": "success",
      "gameState": game.getState(),
      "gameToken": game.getToken().getToken(),
      "playerToken": player.getToken().getToken(),
      "host": game.getHost(),
      "iteration": iteration,
      "started": !game.playerCanJoin(),
      "finished": game.isFinished(),
      "winningRole": game.getWinningRole(),
      "playerTokens": playerTokensInGame,
      "playerNames": playerNamesInGame,
      "playerRoles": playerRolesInGame,
      "playersAliveInGame": playerAliveInGame,
      "role": player.getRole(),
      "roleDescription": player.getRole() + " role description",
      "alive": player.isAlive(),
      "substate": game.getSubState(),
      "voteIteration": voteIteration
    };
    return GameData.addPlayerSpecificData(game, player, generalGameData);

    // Now; put the player-specific data in there.
  }

  public static addPlayerSpecificData(game: Game, player: Player, currentData: any): any {
    // Narrator-specific data
    if (player.getRole() === GameRole.NARRATOR) {
      // Add night-specific data. Thus; roles still needed to perform and players currently killed in night.
      let rolesStillNeededInNight: GameRole[] = [];
      let playersKilledInNight: string[] = [];
      if (game.getNight() != undefined) {
        rolesStillNeededInNight = (<Night> game.getNight()).rolesThatStillHaveToPerform();
        playersKilledInNight = (<Night> game.getNight()).getKilledPlayers().map(player => player.getName());
      }

      let playersStillNeedingToVote: string[] = [];
      let voteWinner = "Undecided";

      // Next: Voting data
      if (game.getVote() != undefined) {
        playersStillNeedingToVote = (<Vote> game.getVote()).getPlayerNamesThatStillHaveToVote();
        const voteWinnerInGame = (<Vote> game.getVote()).getWinner();
        if (voteWinnerInGame != undefined) {
          voteWinner = PlayerManager.get().getByToken(voteWinnerInGame).getName();
        } else if ((<Vote> game.getVote()).isTie()) {
          voteWinner = "Tied";
        }

      }

      const playerSpecificData = { "rolesStillInNight": rolesStillNeededInNight, "playersKilledInNight": playersKilledInNight,
        "playersStillNeedingToVote": playersStillNeedingToVote, "voteWinner": voteWinner};
      return {...currentData, ...playerSpecificData};
    }

    // Medium-specific data
    if (player.getRole() === GameRole.MEDIUM) {
      // First check if there is a night, otherwise return currentData.
      const night : undefined | Night = game.getNight();
      if (night === undefined) {
        return currentData;
      }
      // We now know there is actually a night in the game.

      // Note: Below if-statement does NOT contain Medium, but wolves as it only returns the choice of a medium
      // Thus, always being outside of state NIGHTTIME_MEDIUM.
      if (game.getSubState() === SubState.NIGHTTIME_SELECTION || game.getSubState() === SubState.NIGHTTIME_WOLVES) {
        // IFF medium has performed their action, always return result.
        // First, check if medium checked a player.
        if (night.getPlayerMediumChecked() !== undefined) {
          // Medium checked a player, add this key and return
          const playerChecked = <Player> night.getPlayerMediumChecked();
          const playerSpecificData = { "playerNameChecked": playerChecked.getName(),
            "playerRoleChecked": playerChecked.getRole() };
          return {...currentData, ...playerSpecificData};
        }
      }
    }
    return currentData;
  }
}
