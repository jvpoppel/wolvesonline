/**
 * Voting:
 *  In this method; POST without param onPlayer is handled as method === "GET".
 *
 *  Method will always return "failed" if game does not have a vote.
 *
 *  POST (without onPlayer) -> Get key value pairs of players and who they voted on.
 *    RETURN "unauthorized" in following cases:
 *      (SubState != PostVote || SubState != TiedVote) AND calling player != Narrator
 *    RETURN "failed" IFF SubState != PostVote OR SubState != Voting OR incorrect tokens
 *  POST (with onPlayer) -> Vote for a player.
 *    RETURN "unauthorized" IFF player == Narrator OR player is dead
 *    RETURN "failed" IFF player has already voted OR SubState != Voting
 *  PUT -> Reset vote
 *    RETURN "unauthorized" iff player != Narrator
 *    RETURN "failed" iff result != 'Tie'
 *  FINISH -> Finish vote. Reached with other endpoint, but bundled in this handling class.
 *    RETURN "unauthorized" iff player != Narrator
 *    RETURN "failed" iff result == tie || result == undefined
 *
 *  @param method ONE OF 'GET', 'POST', 'PUT'
 *  @param gameToken Supposed game
 *  @param callingPlayer Player calling the endpoint (PlayerToken)
 *  @param onPlayer OPTIONAL; Only mandatory for {@param method} == POST. Player that receives the vote
 */
import {TokenManager} from "../manager/TokenManager";
import {PlayerToken} from "../model/PlayerToken";
import {NullToken} from "../model/NullToken";
import {GameToken} from "../model/GameToken";
import {GameManager} from "../manager/GameManager";
import {Game} from "../data/Game";
import {Player} from "../data/Player";
import {InternalAPIReturns} from "./responses/InternalAPIReturns";
import {SubState} from "../model/SubState";
import {PlayerManager} from "../manager/PlayerManager";
import {Vote} from "../data/Vote";
import {getLogger} from "../endpoint";

export function APIVoting(method: string, gameToken: string, callingPlayer: string, onPlayer?: string): any {
  const resolvedCallingPlayer: PlayerToken | NullToken = TokenManager.get().getFromString(callingPlayer);
  const resolvedGame: GameToken | NullToken = TokenManager.get().getFromString(gameToken);
  let resolvedOnPlayer: PlayerToken | undefined = undefined;

  if (method !== "GET") {
    getLogger().debug("[APIVoting] Start with method " + method);
  }

  // Check optional token onPlayer
  if (onPlayer !== undefined) {
    const resolvedToken = TokenManager.get().getFromString(onPlayer);
    if (resolvedToken.isPlayerToken()) {
      resolvedOnPlayer = <PlayerToken> resolvedToken;
    }
  }

  const resolvedCallingPlayerPlayer = PlayerManager.get().getByToken(<PlayerToken> resolvedCallingPlayer);

  // Check mandatory tokens
  if (resolvedCallingPlayer.isNullToken() || resolvedGame.isNullToken()) {
    getLogger().debug("[APIVoting] One of provided tokens was Null");
    return { "status": InternalAPIReturns.FAILED };
  }
  const game: Game = GameManager.get().getByToken(resolvedGame);

  // Next, check if game actually has a vote
  if (game.getVote() === undefined) {
    getLogger().debug("[APIVoting] Game.GetVote() returned 'Undefined'");
    return { "status": InternalAPIReturns.FAILED };
  }

  // Next, check authorization pre-conditions
  if (method === "PUT" || method === "FINISH") {
    if ((<Player> game.getNarrator()).getToken() !== resolvedCallingPlayer) {
      getLogger().debug("[APIVoting] User was not the narrator");
      return { "status": InternalAPIReturns.UNAUTHORIZED };
    }
  } else if (method === "GET") {
    if (((<Player> game.getNarrator()).getToken() !== resolvedCallingPlayer) &&
      (game.getSubState() != SubState.DAYTIME_POSTVOTE && game.getSubState() != SubState.DAYTIME_TIEDVOTE)) {
      getLogger().debug("[APIVoting] User was not narrator, Or gamestate was not valid");
      return { "status": InternalAPIReturns.UNAUTHORIZED };
    }
  } else if (method === "POST") {
    if ((<Player> game.getNarrator()).getToken() === resolvedCallingPlayer) {
      getLogger().debug("[APIVoting] User was narrator");
      return { "status": InternalAPIReturns.UNAUTHORIZED };
    } else if (!resolvedCallingPlayerPlayer.isAlive()) {
      getLogger().debug("[APIVoting] User is not alive");
      return { "status": InternalAPIReturns.UNAUTHORIZED };
    }
  }

  // Next, handle requests
  if (method === "PUT") {

    // PUT request -> Reset vote.
    if (!(<Vote> game.getVote()).isTie()) {
      getLogger().debug("[APIVoting] Game is not a tie");
      return { "status": InternalAPIReturns.FAILED };
    } else {
      (<Vote> game.getVote()).resetVote();
      game.increaseIteration();
      return { "status": InternalAPIReturns.SUCCESS };

    }

  }

  if (method === "POST") {
    if (game.getSubState() !== SubState.DAYTIME_VOTING) {
      getLogger().debug("[APIVoting] Game is not in state 'Voting'");
      return { "status": InternalAPIReturns.FAILED };
    }

    // Check if onPlayer is actually defined
    if (resolvedOnPlayer === undefined) {
      getLogger().debug("[APIVoting] No player to vote on defined (param req.body.onPlayer)");
      return {"status": InternalAPIReturns.FAILED };
    }
    if (!(<Vote> game.getVote()).processVote(<PlayerToken> resolvedCallingPlayer, resolvedOnPlayer)) {
      getLogger().debug("[APIVoting] Game ProcessVote returned false");
      return {"status": InternalAPIReturns.FAILED };
    }
    getLogger().debug("[APIVoting] POST Vote on player was Successful");
    return {"status": InternalAPIReturns.SUCCESS };
  }

  if (method === "GET") {
    const toReturn: any = { "status": InternalAPIReturns.SUCCESS };
    const performedVotes = (<Vote> game.getVote()).getPerformedVotes();
    performedVotes.keys().forEach(player => {
      toReturn[player.getToken().getToken()] = performedVotes.get(player).getName();
    });
    return toReturn;
  }

  if (method === "FINISH") {
    if ((<Vote> game.getVote()).isTie() || (<Vote> game.getVote()).getWinner() === undefined) {
      getLogger().debug("[APIVoting] Game is in a tie, or winner was undefined.");
      return {"status": InternalAPIReturns.FAILED };
    }
    if (!game.finishVote()) {
      getLogger().debug("[APIVoting] Game ProcessFinishVote returned false.");
      return {"status": InternalAPIReturns.FAILED};
    }
    return {"status": InternalAPIReturns.SUCCESS};
  }
  getLogger().debug("[APIVoting] Method not known");
  return {"status": InternalAPIReturns.FAILED };
}
