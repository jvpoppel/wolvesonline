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

      if (playerIsHost) {
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], true);
      } else {
        htmlToAdd += playerListRow(playerNamesAsList[playerIndex], playerTokensAsList[playerIndex], false);
      }

      playerIndex++;
    }
    if (playerIsHost) {
      WebElements.PLAYER_LIST_BODY_HOST().innerHTML = htmlToAdd;
    } else {
      WebElements.PLAYER_LIST_BODY_PLAYER().innerHTML = htmlToAdd;
    }

    // Add listeners to created kick-buttons if player is host
    if (playerIsHost) {
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
    DisplayManager.ShowCorrectPlayerList(playerIsHost);


  }
}

export async function kick(event) {
  const playerToKick = event.target.id.split("-")[0];
  await KickPlayerFromGameAPI.send(playerToKick, LocalStorage.gameToken(), LocalStorage.playerToken()).then(response => {
    if (response.status !== "success") {
      console.log("KickPlayerFromGame failed:" + response);
    }
  });
}
