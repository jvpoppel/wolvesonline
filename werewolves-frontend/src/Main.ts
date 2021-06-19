import {WebElements} from "./elem/WebElements";
import {CreateGameAPI} from "./api/CreateGameAPI";
import {JoinGameAPI} from "./api/JoinGameAPI";
import {LocalStorage} from "./data/LocalStorage";
import {ReconnectGameAPI} from "./api/ReconnectGameAPI";
import {DisplayManager} from "./elem/DisplayManager";
import {Game} from "./game/Game";
import {TSMap} from "typescript-map";

$(() => {
  new Main();
});

export class Main {

  private currentGame: Game;

  constructor() {
    this.setupBaseEventListeners();

    /*
    If LocalStorage contains both a game- and player token, attempt to reconnect.
    Otherwise, clear anything still present in LocalStorage and go to homepage.
     */
    if ((LocalStorage.gameToken() != null) && (LocalStorage.playerToken() != null)) {
      this.reconnectGameApi(LocalStorage.gameToken(), LocalStorage.playerToken());
    } else {
      LocalStorage.clear();
      DisplayManager.LoadingToHome();
    }
  }

  /*
  Perform API call to create a game, and start it locally
   */
  public async performCreateGameApi(): Promise<void> {
    const playerName: string = (<HTMLInputElement> WebElements.PLAYER_NAME()).value;
    await CreateGameAPI.send(playerName).then(response => {
      this.currentGame = new Game(response.get("gameToken"), response.get("playerToken")).start();
    });
  }

  /*
  Perform API call to join a game, and start it locally
   */
  public async performJoinGameApi(): Promise<void> {
    const gameToken: string = (<HTMLInputElement> WebElements.JOIN_TOKEN()).value;
    const playerName: string = (<HTMLInputElement> WebElements.PLAYER_NAME()).value;
    await JoinGameAPI.send(gameToken, playerName).then(response => {
      this.currentGame = new Game(response.get("gameToken"), response.get("playerToken")).start();
    });
  }

  /*
  Perform API call to reconnect to an existing game, and start it if it exists.
   */
  public async reconnectGameApi(gameToken: string, playerToken: string): Promise<void> {
    await ReconnectGameAPI.send(gameToken, playerToken).then(response => {
      if (response.get("connected") === "success") {
        this.currentGame = new Game(response.get("gameToken"), response.get("playerToken")).start();
      }
    });
  }

  private setupBaseEventListeners(): void {
    WebElements.CREATE_GAME().addEventListener("click", () => this.performCreateGameApi());
    WebElements.JOIN_BUTTON().addEventListener("click", () => this.performJoinGameApi());
  }

}
