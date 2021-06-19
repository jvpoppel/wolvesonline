import {GameData} from "../model/GameData";
import {TSMap} from "typescript-map";
import {WebElements} from "./WebElements";
import {playerListRow} from "./snippet/PlayerListRow";
import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "./DisplayManager";

export class UpdateWithGameData {
  public static perform(data: GameData): void {

    const playerIsHost: boolean = (data.host === LocalStorage.playerToken());
    console.log("Player is host? " + playerIsHost);

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
    DisplayManager.ShowCorrectPlayerList(playerIsHost);


  }
}
