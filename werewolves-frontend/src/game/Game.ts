import {CheckGameIterationAPI} from "../api/CheckGameIterationAPI";

export class Game {

  private gameToken: string;
  private playerToken: string;
  private iteration: number; // Known game iteration
  private run: boolean; // Iff true: Loop continues

  constructor(gameToken: string, playerToken: string) {
    this.gameToken = gameToken;
    this.playerToken = playerToken;
    this.iteration = 0;
    this.run = false;
  }

  public start(): Game {
    this.run = true;
    this.loop();
    return this;
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async loop() {
    while (this.run) {
      await this.sleep(1000);
      const serverIteration = await CheckGameIterationAPI.send(this.gameToken, this.playerToken);
      if (serverIteration != this.iteration) {
        console.log("Out of sync");
      }
    }
  }
}
