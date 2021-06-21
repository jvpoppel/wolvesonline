import {GameData} from "../model/GameData";
import {TSMap} from "typescript-map";
import {WebElements} from "./WebElements";
import {playerListRow} from "./snippet/PlayerListRow";
import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "./DisplayManager";
import {KickPlayerFromGameAPI} from "../api/KickPlayerFromGameAPI";
import {SubState} from "../model/SubState";

export class UpdateWithGameData {
  public static perform(data: GameData): void {

    const playerIsHost: boolean = (data.host === LocalStorage.playerToken());

    const playerTokensAsList = Array.from(data.playerTokens);
    const playerNamesAsList = Array.from(data.playerNames);
    const playerRolesAsList = Array.from(data.playerRoles);
    const playersAliveAsList = Array.from(data.playersAliveInGame);

    // First; update player list.
    let htmlToAdd = "";

    const playersAndTokens = new TSMap<string, string>();
    let playerIndex = 0;
    while (playerIndex < playerNamesAsList.length) {
      playersAndTokens.set(playerTokensAsList[playerIndex], playerNamesAsList[playerIndex]);

      if (playerIsHost && !data.started) { // If host: Only add when game has not been started.
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], (!data.started), "", true);
      } else {
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex],
          false, playerRolesAsList[playerIndex], playersAliveAsList[playerIndex] === "true");
      }

      playerIndex++;
    }
    if (playerIsHost && !data.started) { // Only if game has not been started, host needs a different table.
      WebElements.PLAYER_LIST_BODY_HOST().innerHTML = htmlToAdd;
    } else {
      WebElements.PLAYER_LIST_BODY_PLAYER().innerHTML = htmlToAdd;
    }

    // Add listeners to created kick-buttons if player is host and game has not been started yet.
    if (playerIsHost && !data.started) {
      playerIndex = 0;
      while (playerIndex < playerTokensAsList.length) {
        if (playerTokensAsList[playerIndex] === data.host) {
          WebElements.KICK_PLAYER(playerTokensAsList[playerIndex]).remove();
        } else {
          WebElements.KICK_PLAYER(playerTokensAsList[playerIndex]).addEventListener("click", kick, false);
        }
        playerIndex++;
      }

    }
    // If game started; Narrator? column is not needed anymore.
    DisplayManager.ShowCorrectPlayerList(playerIsHost && !data.started);

    /*
    Next, we update the display values of the Start and Disconnect buttons
     */
    if (data.started == false) {
      if (playerIsHost) {
        DisplayManager.SHOW_START();
      }
    } else {
      DisplayManager.HIDE_START_STOP();

      /* Also, if game has started, update the game substate */
      DisplayManager.UpdateGameSubState(data.substate);
    }

    /*
    After that, we update the role information
     */
    WebElements.ROLE_NAME().innerHTML = data.role;
    WebElements.ROLE_INFO().innerHTML = data.roleDescription;

    /*
    After that, check if game is in Night and update the game for the narrator accordingly
     */
    if (data.substate === "Night" && data.role === "Narrator") {
      DisplayManager.ShowNightControls();
      const rolesStillForNight = Array.from(data.playerNames);
      if (rolesStillForNight.length == 0) {
        WebElements.FINISH_NIGHT().style.display = "";
      } else {
        WebElements.FINISH_NIGHT().style.display = "none";
      }

      // Make list of which buttons to hide and remove the ones that have to stay.
      const showButtons: HTMLElement[] = [WebElements.WOLVES_NIGHT(), WebElements.MEDIUM_NIGHT()];
      rolesStillForNight.forEach(function(role) {
        if (role === "Wolf") {
          showButtons.splice(showButtons.indexOf(WebElements.WOLVES_NIGHT()), 1);
        } else if (role === "Medium") {
          showButtons.splice(showButtons.indexOf(WebElements.MEDIUM_NIGHT()), 1);
        }
      });
      showButtons.forEach(button => button.style.display = "none");
    } else {
      DisplayManager.HideNightControls();
    }
  }
}

export async function kick(event) {
  const playerToKick = event.target.id.split("-")[0];
  await KickPlayerFromGameAPI.send(playerToKick, LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid()).then(response => {
    if (response.status !== "success") {
      console.log("KickPlayerFromGame failed:" + response);
    }
  });
}
