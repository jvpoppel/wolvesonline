import {GameData} from "../model/GameData";
import {TSMap} from "typescript-map";
import {WebElements} from "./WebElements";
import {playerListRow} from "./snippet/PlayerListRow";
import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "./DisplayManager";
import {KickPlayerFromGameAPI} from "../api/KickPlayerFromGameAPI";

export class UpdateWithGameData {
  public static perform(data: GameData): void {

    const playerIsHost: boolean = (data.host === LocalStorage.playerToken());

    const playerTokensAsList = Array.from(data.playerTokens);
    const playerNamesAsList = Array.from(data.playerNames);

    // First; update player list.
    let htmlToAdd = "";

    const playersAndTokens = new TSMap<string, string>();
    let playerIndex = 0;
    while (playerIndex < playerNamesAsList.length) {
      playersAndTokens.set(playerTokensAsList[playerIndex], playerNamesAsList[playerIndex]);

      if (playerIsHost) { // If host: Only add when game has not been started.
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], (!data.started));
      } else {
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], false);
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
