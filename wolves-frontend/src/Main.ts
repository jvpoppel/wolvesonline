import {WebElements} from "./elem/WebElements";
import {CreateGameAPI} from "./api/CreateGameAPI";
import {JoinGameAPI} from "./api/JoinGameAPI";
import {LocalStorage} from "./data/LocalStorage";
import {ReconnectGameAPI} from "./api/ReconnectGameAPI";
import {DisplayManager} from "./elem/DisplayManager";
import {Game} from "./game/Game";
import {DisconnectAPI} from "./api/DisconnectAPI";
import {StartGameAPI} from "./api/StartGameAPI";
import {NightApi} from "./api/NightApi";

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
    if ((LocalStorage.gameToken() != null) && (LocalStorage.playerToken() != null) && (LocalStorage.uuid() != null)) {
      this.reconnectGameApi(LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid());
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
  Perform API call to join a game, and initiate it locally
   */
  public async performJoinGameApi(): Promise<void> {
    const gameToken: string = (<HTMLInputElement> WebElements.JOIN_TOKEN()).value;
    const playerName: string = (<HTMLInputElement> WebElements.PLAYER_NAME()).value;
    await JoinGameAPI.send(gameToken, playerName).then(response => {
      this.currentGame = new Game(response.get("gameToken"), response.get("playerToken")).start();
    });
  }

  /*
  Perform API call to reconnect to an existing game, and initiate it if it exists.
   */
  public async reconnectGameApi(gameToken: string, playerToken: string, uuid: string): Promise<void> {
    await ReconnectGameAPI.send(gameToken, playerToken, uuid).then(response => {
      if (response.get("connected") === "success") {
        this.currentGame = new Game(response.get("gameToken"), response.get("playerToken")).start();
      } else {
        LocalStorage.clear();
        DisplayManager.LoadingToHome();
      }
    });
  }

  /*
  Perform API call to start a game
   */
  public async performStartGameApi(): Promise<void> {
    let narratorToken = "";
    WebElements.NARRATOR_RADIOBUTTONS().forEach(function(radioButton: HTMLInputElement) {
      if (radioButton.checked) {
        narratorToken = radioButton.id.split("-")[0];
      }
    });
    if (narratorToken === "") {
      window.alert("Could not start game: Please choose a narrator");
      return;
    }
    await StartGameAPI.send(LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid(), narratorToken);
  }

  public async performNightApi(action: string): Promise<void> {
    await NightApi.send(LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid(), action).then(status => {
      if (status !== "success") {
        console.log("Could not perform selected Night action!");
      }
    });
  }

  public async performDisconnectFromGameApi(): Promise<void> {
    await DisconnectAPI.send(LocalStorage.gameToken(), LocalStorage.playerToken(), LocalStorage.uuid());
  }

  private setupBaseEventListeners(): void {
    WebElements.CREATE_GAME().addEventListener("click", () => this.performCreateGameApi());
    WebElements.JOIN_BUTTON().addEventListener("click", () => this.performJoinGameApi());
    WebElements.DISCONNECT().addEventListener("click", () => this.performDisconnectFromGameApi());
    WebElements.START().addEventListener("click", () => this.performStartGameApi());
    WebElements.ROLE_INFO_BUTTON().addEventListener("click", () => $("#roleModal").modal("show"));
    WebElements.START_NIGHT().addEventListener("click", () => this.performNightApi("start"));
    WebElements.FINISH_NIGHT().addEventListener("click", () => this.performNightApi("finish"));
    WebElements.WOLVES_NIGHT().addEventListener("click", () => this.performNightApi("wolves"));
    WebElements.MEDIUM_NIGHT().addEventListener("click", () => this.performNightApi("medium"));
  }

}
