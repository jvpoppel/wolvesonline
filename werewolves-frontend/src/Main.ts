import {WebElements} from "./elem/WebElements";
import {CreateGameAPI} from "./api/CreateGameAPI";
import {JoinGameAPI} from "./api/JoinGameAPI";

$(() => {
  new Main();
});

export class Main {

  constructor() {
    this.setupBaseEventListeners();
  }

  public performCreateGameApi(): void {
    CreateGameAPI.send();
  }

  public performJoinGameApi(): void {
    const gameToken: string = (<HTMLInputElement> WebElements.JOIN_TOKEN()).value;
    JoinGameAPI.send(gameToken);
  }

  private setupBaseEventListeners(): void {
    WebElements.CREATE_GAME().addEventListener("click", () => this.performCreateGameApi());
    WebElements.JOIN_BUTTON().addEventListener("click", () => this.performJoinGameApi());
  }

}
