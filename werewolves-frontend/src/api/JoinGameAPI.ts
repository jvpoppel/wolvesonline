import {LocalStorage} from "../data/LocalStorage";
import {DisplayManager} from "../elem/DisplayManager";
import {BaseApi} from "./BaseApi";

export class JoinGameAPI {

  private static sending: boolean;

  public static async send(gameToken: string): Promise<void> {
    if (this.sending) {
      return;
    }
    this.sending = true;

    await new BaseApi().post<{player: string}>("http://localhost:2306/api/game/join", {"gameToken": gameToken})
      .then(({player}) => {
        LocalStorage.setPlayerToken(player);
        LocalStorage.setGameToken(gameToken);
        DisplayManager.HomePageToGame();
        DisplayManager.UpdateGameCode(gameToken);
      }).finally(() => { this.sending = false; });
  }
}
