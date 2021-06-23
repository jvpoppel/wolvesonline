import {GameRole} from "../model/GameRole";
import {Player} from "./Player";

export class Night {

  private rolesInNight: GameRole[];
  private killedPlayers: Player[];
  private playerMediumChecked: Player | undefined;

  constructor(rolesInNight: GameRole[]) {
    this.playerMediumChecked = undefined;
    this.rolesInNight = Array.from(rolesInNight);
    if (this.rolesInNight.indexOf(GameRole.CIVILIAN) > 0) {
      this.rolesInNight.splice(this.rolesInNight.indexOf(GameRole.CIVILIAN), 1);
    }
    this.killedPlayers = [];
  }

  public addKilledPlayer(player: Player) {
    this.killedPlayers.push(player);
  }

  public getKilledPlayers(): Player[] {
    return this.killedPlayers;
  }

  public getPlayerMediumChecked(): Player | undefined {
    return this.playerMediumChecked;
  }

  public setPlayerMediumChecked(player: Player): void {
    this.playerMediumChecked = player;
  }

  public rolesThatStillHaveToPerform(): GameRole[] {
    return this.rolesInNight;
  }

  public letRolePerform(role: GameRole): boolean {
    if (this.rolesInNight.indexOf(role) < 0) {
      return false;
    }
    this.rolesInNight.splice(this.rolesInNight.indexOf(role), 1);
    return true;
  }

  public isFinished(): boolean {
    return this.rolesInNight.length == 0;
  }
}
