import {DisplayManager} from "../elem/DisplayManager";
import {BaseApi} from "./BaseApi";
import {LocalStorage} from "../data/LocalStorage";
import {Config} from "../Config";
import {TSMap} from "typescript-map";

export class ReconnectGameAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string): Promise<TSMap<string, string>> {
    if (this.sending) {
      console.warn("ReconnectGameAPI: Asked for new request but previous request is still sending!");
      return;
    }
    this.sending = true;

    return await new BaseApi().post<{connected: string}>("{0}:{1}/api/game/reconnect".replace("{0}", Config.serverURL)
      .replace("{1}", Config.port), {"gameToken": gameToken, "playerToken": playerToken})
      .then(({connected}) => {
        if (connected.valueOf() === "success") {
          DisplayManager.LoadingToGame();
          DisplayManager.UpdateGameCode(gameToken);
        } else {
          LocalStorage.clear();
          DisplayManager.LoadingToHome();
        }
        this.sending = false;
        return new TSMap<string, string>().set("gameToken", gameToken).set("playerToken", playerToken).set("connected", connected);
      });
  }
}
