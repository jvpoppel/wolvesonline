import {WebElements} from "./elem/WebElements";
import {CreateGameAPI} from "./api/CreateGameAPI";
import {JoinGameAPI} from "./api/JoinGameAPI";
import {LocalStorage} from "./data/LocalStorage";
import {ReconnectGameAPI} from "./api/ReconnectGameAPI";
import {DisplayManager} from "./elem/DisplayManager";

$(() => {
  new Main();
});

export class Main {

  constructor() {
    this.setupBaseEventListeners();

    if ((LocalStorage.gameToken() != null) && (LocalStorage.playerToken() != null)) {
      this.reconnectGameApi(LocalStorage.gameToken(), LocalStorage.playerToken());
    } else {
      LocalStorage.clear();
      DisplayManager.LoadingToHome();
    }
  }

  public performCreateGameApi(): void {
    CreateGameAPI.send();
  }

  public performJoinGameApi(): void {
    const gameToken: string = (<HTMLInputElement> WebElements.JOIN_TOKEN()).value;
    JoinGameAPI.send(gameToken);
  }

  public reconnectGameApi(gameToken: string, playerToken: string): void {
    ReconnectGameAPI.send(gameToken, playerToken);
  }

  private setupBaseEventListeners(): void {
    WebElements.CREATE_GAME().addEventListener("click", () => this.performCreateGameApi());
    WebElements.JOIN_BUTTON().addEventListener("click", () => this.performJoinGameApi());
  }

}
