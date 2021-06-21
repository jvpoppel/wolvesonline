import {GameToken} from "../model/GameToken";
import {TokenBuilder} from "./TokenBuilder";
import {Token} from "../model/Token";
import {Player} from "./Player";
import {SubState} from "../model/SubState";
import {GameRole} from "../model/GameRole";
import {Night} from "./Night";
import {Director} from "../manager/Director";
import {TSMap} from "typescript-map";

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
  private players: Array<Player>;
  private substate: SubState;
  private rolesInGame: GameRole[];
  private currentNight: Night | undefined;
  private winningRole: GameRole;

  constructor() {
    this.state = GameState.OPEN_WAITFORPLAYERS;
    this.token = TokenBuilder.nullToken();
    this.iteration = 0;
    this.host = undefined;
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

  public setToken(token: GameToken): Game {
    this.token = token;
    return this;
  }

  public start(): boolean {
    if (this.state != GameState.OPEN_WAITFORPLAYERS) {
      return false;
    }
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
    this.substate = SubState.DAYTIME_VOTING;

    // At the end of the night, check win conditions.
    this.checkWinConditions();

    this.increaseIteration();
    return true;
  }

  public checkWinConditions(): void {
    if (this.rolesInGame.indexOf(GameRole.WOLF) < 0) {
      // No wolves in game? Civilians have won!
      this.finish(GameRole.CIVILIAN);
      return;
    }

    if (this.rolesInGame.length > 1) {
      // More than 1 role in game (thus, at least one Non-Wolf player is in game). Game is not finished.
      // Do nothing.

    } else {
      // With the first if-statement we know there is at least one wolf in game, this else is only reached if there
      // is exactly one role still in game, thus only wolves are left. Wolves have won.
      this.finish(GameRole.WOLF);
    }
  }

  /**
   * Performs kills on players. Also updates the list of roles still in game if necessary.
   * @param killedPlayers Players to be killed
   */
  public performKills(killedPlayers: Player[]): void {
    const killedRoles: GameRole[] = [];
    const currentRolesInGame = this.rolesInGame;
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
    return this;
  }

  /**
   * Returns the game role that has won the game.
   * Please note; winning role = Undecided while there is no winner.--
   */
  public getWinningRole(): GameRole {
    return this.winningRole;
  }

  public finishVote(playerToKill: Player): boolean {
    if (this.substate != SubState.DAYTIME_VOTING) {
      return false;
    }
    this.performKills([playerToKill]);
    this.checkWinConditions();
    this.substate = SubState.DAYTIME_POSTVOTE;
    this.increaseIteration();
    return true;
  }
}
