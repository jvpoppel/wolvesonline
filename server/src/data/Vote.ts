import {PlayerToken} from "../model/PlayerToken";
import {TSMap} from "typescript-map";
import {Token} from "../model/Token";
import {TokenBuilder} from "./TokenBuilder";
import {Player} from "./Player";
import {PlayerManager} from "../manager/PlayerManager";
import {Game} from "./Game";
import {getLogger} from "../endpoint";

export class Vote {

  private connectedGame: Game;
  private voteIteration: number; // When vote gets reset, this number increases.
  private votingPlayers: PlayerToken[];
  private playersVoted: PlayerToken[];
  private playersThatStillHaveToVote: PlayerToken[];
  private performedVotes: TSMap<Player, Player>; // Purely for frontend, maps Voter to Receiver
  private votesPerPlayer: TSMap<PlayerToken, number>;
  private voteIsTie: boolean;
  private voteResult: PlayerToken | undefined;

  constructor(connectedGame: Game, players: PlayerToken[], narrator: PlayerToken) {
    this.connectedGame = connectedGame;
    this.voteIteration = 0;

    this.votingPlayers = Array.from(players);
    // Remove narrator from voting players
    this.votingPlayers.splice(this.votingPlayers.indexOf(narrator), 1);
    this.playersThatStillHaveToVote = Array.from(this.votingPlayers);

    // TODO: REMOVE BELOW DEBUG CODE!!!
    getLogger().debug("Vote: Printing all players that still have to vote: ");
    this.playersThatStillHaveToVote.forEach(player => getLogger().debug("Vote: " + player.getToken()));

    this.playersVoted = [];
    this.votesPerPlayer = new TSMap<PlayerToken, number>();
    this.performedVotes = new TSMap<Player, Player>();
    this.voteResult = undefined;
    this.voteIsTie = false;
    players.forEach(player => this.votesPerPlayer.set(player, 0)); // Init map
  }

  public resetVote(): void {
    this.playersVoted = [];
    this.playersThatStillHaveToVote = Array.from(this.votingPlayers);
    this.voteIsTie = false;
    this.voteResult = undefined;
    this.votesPerPlayer.clear();
    this.performedVotes.clear();
    this.votingPlayers.forEach(player => this.votesPerPlayer.set(player, 0)); // Init map
    this.voteIteration ++;
    this.connectedGame.setSubStateToVoting();
  }

  public processVote(fromPlayer: PlayerToken, onPlayer: PlayerToken): boolean {
    if (this.playersThatStillHaveToVote.indexOf(fromPlayer) < 0) {
      getLogger().debug("Vote: Player " + fromPlayer.getToken() + " has already voted! (Index " + this.playersThatStillHaveToVote.indexOf(fromPlayer) + ")");
      getLogger().debug("Vote: Printing all players that still have to vote: ");
      this.playersThatStillHaveToVote.forEach(player => getLogger().debug("Vote: " + player.getToken()));
      return false; // Player has already voted
    }
    this.playersVoted.push(fromPlayer);
    this.playersThatStillHaveToVote.splice(this.playersThatStillHaveToVote.indexOf(fromPlayer), 1);
    this.votesPerPlayer.set(onPlayer, this.votesPerPlayer.get(onPlayer) + 1);
    this.performedVotes.set(PlayerManager.get().getByToken(fromPlayer), PlayerManager.get().getByToken(onPlayer));
    this.checkVoteResult();
    return true;
  }

  public checkVoteResult(): void {
    if (this.votingPlayers.length != this.playersVoted.length) {
      // Not all players voted, do nothing
      getLogger().debug("Vote: CheckVoteResult did nothing as not all players have voted");
      return;
    }
    let highestAmountOfVotes = -1;
    let amountOfPlayersWithHighestAmountOfVote = 0;
    let winner: Token = TokenBuilder.nullToken();
    this.votesPerPlayer.keys().forEach(key => {
      const votesForPlayer = this.votesPerPlayer.get(key);
      if (votesForPlayer > highestAmountOfVotes) {
        highestAmountOfVotes = votesForPlayer;
        amountOfPlayersWithHighestAmountOfVote = 1;
        winner = key;
      } else if (votesForPlayer == highestAmountOfVotes) {
        amountOfPlayersWithHighestAmountOfVote++;
      }
    });
    if (amountOfPlayersWithHighestAmountOfVote > 1) {
      // More than 1 player with highest amount of vote
      this.voteIsTie = true;
      this.connectedGame.voteHasReachedTie();
      return;
    } else {
      this.voteResult = <PlayerToken> winner; // If it is not a tie, we know for sure it must be a PlayerToken.
      return;
    }
  }

  public hasFinished(): boolean {
    return (this.voteIsTie) || (this.voteResult !== undefined);
  }

  public isTie(): boolean {
    return this.voteIsTie;
  }

  public getIteration(): number {
    return this.voteIteration;
  }

  public getWinner(): PlayerToken | undefined {
    return this.voteResult;
  }

  /**
   * Purely for frontend, get array of player names that still have to vote
   */
  public getPlayerNamesThatStillHaveToVote(): string[] {
    return this.playersThatStillHaveToVote.map(token => PlayerManager.get().getByToken(token).getName());
  }

  /**
   * Purely for frontend, get map of player votes
   */
  public getPerformedVotes(): TSMap<Player, Player> {
    return this.performedVotes;
  }

  public getPlayersThatStillHaveToVote(): PlayerToken[] {
    return this.playersThatStillHaveToVote;
  }


}
