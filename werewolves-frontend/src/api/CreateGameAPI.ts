import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "../elem/DisplayManager";
import {BaseApi} from "./BaseApi";

export class CreateGameAPI {

  private static sending: boolean;

  public static async send(): Promise<void> {
    if (this.sending) {
      return;
    }
    this.sending = true;

    await new BaseApi().post<{playerToken: string; gameToken: string}>("http://localhost:2306/api/game/create", undefined)
      .then(({playerToken, gameToken}) => {
        LocalStorage.setPlayerToken(playerToken);
        LocalStorage.setGameToken(gameToken);
        DisplayManager.HomePageToGame();
        DisplayManager.PlayerIsHost();
        DisplayManager.UpdateGameCode(gameToken);
      }).finally(() => { this.sending = false; });
  }
}
