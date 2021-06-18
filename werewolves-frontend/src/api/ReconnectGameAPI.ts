import {DisplayManager} from "../elem/DisplayManager";
import {BaseApi} from "./BaseApi";
import {LocalStorage} from "../data/LocalStorage";

export class ReconnectGameAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string): Promise<void> {
    if (this.sending) {
      return;
    }
    this.sending = true;

    await new BaseApi().post<{connected: string}>("http://51.75.76.150:80/api/game/reconnect", {"gameToken": gameToken, "playerToken": playerToken})
      .then(({connected}) => {
        if (connected.valueOf() === "success") {
          DisplayManager.LoadingToGame();
          DisplayManager.UpdateGameCode(gameToken);
        } else {
          LocalStorage.clear();
          DisplayManager.LoadingToHome();
        }
      }).finally(() => { this.sending = false; });
  }
}
