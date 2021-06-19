import { BaseApi } from "./BaseApi";
import { Config } from "../Config";

export class CheckGameIterationAPI {

  private static sending: boolean;

  public static async send(gameToken: string, playerToken: string): Promise<number> {
    if (this.sending) {
      return;
    }
    this.sending = true;

    await new BaseApi().get<{iteration: number}>("{0}:{1}/api/game/{2}/{3}"
      .replace("{0}", Config.serverURL).replace("{1}", Config.port)
      .replace("{2}", gameToken).replace("{3}", playerToken))
      .then(({iteration}) => {
        this.sending = false;
        return iteration;
      });
  }
}
