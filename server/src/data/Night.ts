import {GameRole} from "../model/GameRole";
import {Player} from "./Player";

export class Night {

  private rolesInNight: GameRole[];
  private killedPlayers: Player[];

  constructor(rolesInNight: GameRole[]) {
    this.rolesInNight = rolesInNight;
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
