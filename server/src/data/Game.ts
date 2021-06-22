import {GameToken} from "../model/GameToken";
import {TokenBuilder} from "./TokenBuilder";
import {Token} from "../model/Token";
import {Player} from "./Player";
import {SubState} from "../model/SubState";
import {GameRole} from "../model/GameRole";
import {Night} from "./Night";
import {Director} from "../manager/Director";
import {TSMap} from "typescript-map";
import {Vote} from "./Vote";
import {PlayerToken} from "../model/PlayerToken";
import {PlayerManager} from "../manager/PlayerManager";
import {getLogger} from "../endpoint";

enum GameState {
  OPEN_WAITFORPLAYERS = "OPEN_WAITFORPLAYERS",
  OPEN_INPROGRESS = "OPEN_INPROGRESS",
  RESOLVED_FINALIZE = "RESOLVED_FINALIZE",
  RESOLVED_WAITFORTOKENRELEASE = "RESOLVED_WAITFORTOKENRELEASE"
}

export class Game {

  private token: Token;
  private state: GameState;
  private iteration: number;
  private host: Player | undefined;
  private narrator: Player | undefined;
  private players: Player[];
  private substate: SubState;
  private rolesInGame: GameRole[];
  private currentNight: Night | undefined;
  private winningRole: GameRole;
  private currentVote: Vote | undefined;

  constructor() {
    this.state = GameState.OPEN_WAITFORPLAYERS;
    this.token = TokenBuilder.nullToken();
    this.iteration = 0;
    this.host = undefined;
    this.narrator = undefined;
    this.players = [];
    this.substate = SubState.DAYTIME_FIRST;
    this.rolesInGame = [];
    this.currentNight = undefined;
    this.winningRole = GameRole.UNDECIDED;
  }

  /* Below method should only be called from Director */
  public addPlayer(player: Player): boolean {
    if (this.players.includes(player)) {
      return false;
    }
    this.players.push(player);
    this.increaseIteration();
    return true;
  }

  /* Below method should only be called from Director */
  public deletePlayer(player: Player): boolean {
    const indexOfPlayer: number = this.players.indexOf(player);
    if (indexOfPlayer < 0) {
      return false;
    }
    this.players.splice(indexOfPlayer, 1);
    this.increaseIteration();
    return true;
  }

  public getHost(): string {
    if (this.host === undefined) {
      return "";
    } else {
      return this.host.getToken().getToken();
    }
  }

  public getIteration(): number {
    return this.iteration;
  }

  public getNarrator(): Player | undefined {
    return this.narrator;
  }

  public getNight(): Night | undefined {
    return this.currentNight;
  }

  public getToken(): GameToken {
    return this.token;
  }

  /* Increases the game iteration by 1. Please note: This triggers an update for all clients */
  public increaseIteration(): void {
    this.iteration ++;
  }

  public isFinished(): boolean {
    return this.state == GameState.RESOLVED_FINALIZE || this.state == GameState.RESOLVED_WAITFORTOKENRELEASE;
  }

  public playerCanJoin(): boolean {
    return this.state == GameState.OPEN_WAITFORPLAYERS;
  }

  public addRoleToGame(role: GameRole): void {
    this.rolesInGame.push(role);
  }

  /**
   * Removes given role from roles in game.
   * Use case: Last player of given role dies, thus the role is no longer in game.
   *
   * @param role role to remove from game
   */
  public removeRoleFromGame(role: GameRole): void {
    this.rolesInGame.splice(this.rolesInGame.indexOf(role), 1);
  }

  public setHost(host: Player): Game {
    this.host = host;
    this.increaseIteration();
    return this;
  }

  public setNarrator(narrator: Player): Game {
    this.narrator = narrator;
    return this;
  }

  public setToken(token: GameToken): Game {
    this.token = token;
    return this;
  }

  public start(): boolean {
    if (this.state != GameState.OPEN_WAITFORPLAYERS) {
      return false;
    } else if (this.narrator === undefined) {
      return false; // Narrator has to be defined.
    }
    // TODO: REMOVE BELOW DEBUG PRINT
    getLogger().debug("GAME: Starting. Printing all roles in game...");
    this.rolesInGame.forEach(role => getLogger().debug("GAME: " + role.valueOf() + " in game"));

    this.state = GameState.OPEN_INPROGRESS;
    this.substate = SubState.DAYTIME_FIRST;
    this.increaseIteration();
    return true;
  }

  public getState(): GameState {
    return this.state;
  }

  public getSubState(): SubState {
    return this.substate;
  }

  public startNight(): boolean {
    if (this.substate != SubState.DAYTIME_FIRST && this.substate != SubState.DAYTIME_POSTVOTE && this.substate != SubState.DAYTIME_GAMEFINISHED) {
      return false;
    }
    // If game finished, don't start night
    if (this.state === GameState.RESOLVED_FINALIZE || this.state === GameState.RESOLVED_WAITFORTOKENRELEASE) {
      return false;
    }
    // Remove vote
    this.currentVote = undefined;
    this.substate = SubState.NIGHTTIME_SELECTION;
    this.currentNight = new Night(this.rolesInGame);
    this.increaseIteration();
    return true;
  }

  public finishNight(): boolean {
    if (this.currentNight === undefined) {
      return false;
    } else if (!this.currentNight.isFinished()) {
      return false;
    }
    // Night is really finished; perform kills, remove night from memory and set subState to morning
    this.performKills(this.currentNight.getKilledPlayers());
    this.currentNight = undefined;

    // At the end of the night, check win conditions.
    this.checkWinConditions();

    if (this.isFinished()) {
      getLogger().info("GAME: Finished");
      this.increaseIteration();
    } else {
      getLogger().info("GAME: Starting vote now");
      this.startVote();
      this.substate = SubState.DAYTIME_VOTING;
    }
    return true;
  }

  public checkWinConditions(): void {
    // TODO: REMOVE BELOW DEBUG PRINT
    getLogger().debug("GAME: Check Win Conditions. Printing all roles in game...");
    this.rolesInGame.forEach(role => getLogger().debug("GAME: " + role.valueOf() + " still in game"));

    if (this.rolesInGame.indexOf(GameRole.WOLF) < 0) {
      // No wolves in game? Civilians have won!
      getLogger().info("GAME: Finished because there are no wolves in the game!");
      this.finish(GameRole.CIVILIAN);
      return;
    }

    if (this.rolesInGame.length > 1) {
      // More than 1 role in game (thus, at least one Non-Wolf player is in game). Game is not finished.
      // Do nothing.
      getLogger().info("GAME: Not finished as there is more than 1 active role in the game");
    } else {
      // With the first if-statement we know there is at least one wolf in game, this else is only reached if there
      // is exactly one role still in game, thus only wolves are left. Wolves have won.
      getLogger().info("GAME: Finished because there are only wolves left in the game!");
      this.finish(GameRole.WOLF);
    }
  }

  /**
   * Performs kills on players. Also updates the list of roles still in game if necessary.
   * @param killedPlayers Players to be killed
   */
  public performKills(killedPlayers: Player[]): void {
    const killedRoles: GameRole[] = [];
    const currentRolesInGame = Array.from(this.rolesInGame);
    killedPlayers.forEach(function(player) {
      player.setDead();
      killedRoles.push(player.getRole());
    });
    const alivePlayersInGame: TSMap<GameRole, number> = Director.get().alivePlayersPerRoleInGame(this.getToken());
    killedRoles.forEach(function(role) {
      if (!alivePlayersInGame.has(role)) {
        if (currentRolesInGame.indexOf(role) >= 0) {
          // Above check is neccesary, as multiple players of one role might have died.
          // We only check alive players in game after all killings, thus check is necessary.
          getLogger().info("GAME: PerformKills: Remove role " + role.valueOf() + " as there are no players alive with this role.");
          currentRolesInGame.splice(currentRolesInGame.indexOf(role), 1);
        }
      }
    });
    this.rolesInGame = currentRolesInGame; // Update list of roles still in game.
  }

  /**
   * Put gamestate to Finalized and define the winning role.
   *
   * @param winningRole Game Role that has won the game
   */
  public finish(winningRole: GameRole): Game {
    this.state = GameState.RESOLVED_FINALIZE;
    this.winningRole = winningRole;
    this.substate = SubState.GAME_FINISHED;
    this.increaseIteration();
    return this;
  }

  /**
   * Returns the game role that has won the game.
   * Please note; winning role = Undecided while there is no winner.--
   */
  public getWinningRole(): GameRole {
    return this.winningRole;
  }

  private getAlivePlayers(): Player[] {
    const alivePlayers: Player[] = [];
    this.players.forEach(player => { if (player.isAlive()) { alivePlayers.push(player);} else { getLogger().debug("GAME: Player " + player.getName() + " not alive?");}});
    return alivePlayers;
  }

  /**
   * Only to be used when resetting the vote
   */
  public setSubStateToVoting(): void {
    this.substate = SubState.DAYTIME_VOTING;
  }

  /**
   * Returns true iff no vote has been started
   */
  public startVote(): boolean {
    if (this.currentVote !== undefined) {
      getLogger().info("GAME: Could not start vote; already in progress.");
      return false; // Vote already in progress
    }

    // If game finished, don't start vote
    if (this.state === GameState.RESOLVED_FINALIZE || this.state === GameState.RESOLVED_WAITFORTOKENRELEASE) {
      return false;
    }

    getLogger().info("GAME: Vote started.");
    this.currentVote = new Vote(this, Array.from(this.getAlivePlayers()).map(player => player.getToken()), (<Player> this.narrator).getToken());
    this.increaseIteration();
    return true;
  }

  public getVote(): Vote | undefined {
    return this.currentVote;
  }

  /* Update SubState and update iteration */
  public voteHasReachedTie() {
    this.substate = SubState.DAYTIME_TIEDVOTE;
    this.increaseIteration();
  }

  public finishVote(): boolean {
    if (this.substate != SubState.DAYTIME_VOTING) {
      return false;
    }
    if (this.currentVote === undefined) {
      return false;
    }

    if (!this.currentVote.hasFinished()) {
      return false;
    }

    this.performKills([PlayerManager.get().getByToken(<PlayerToken> this.currentVote.getWinner())]);
    this.checkWinConditions();
    this.substate = SubState.DAYTIME_POSTVOTE;
    this.increaseIteration();
    return true;
  }

  /**
   * To be called on game deletion; resets all data to begin values
   * I.e. removes all references to other data
   */
  public cleanup(): Game {

    this.token = TokenBuilder.nullToken();
    this.host = undefined;
    this.narrator = undefined;
    this.players = [];
    this.rolesInGame = [];
    this.currentNight = undefined;

    return this;

  }
}
