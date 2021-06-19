import {WebElements} from "./WebElements";

export class DisplayManager {

  public static LoadingToHome(): void {
    WebElements.LOADING_PAGE().style.display = "none";
    WebElements.HOME_PAGE().style.display = "";
  }

  public static ShowCorrectPlayerList(forHost: boolean): void {
    if (forHost) {
      WebElements.PLAYER_LIST_HOST().style.display = "";
      WebElements.PLAYER_LIST_PLAYER().style.display = "none";
    } else {
      WebElements.PLAYER_LIST_HOST().style.display = "none";
      WebElements.PLAYER_LIST_PLAYER().style.display = "";
    }
  }

  public static LoadingToGame(): void {
    WebElements.LOADING_PAGE().style.display = "none";
    WebElements.GAME_PAGE().style.display = "";
  }

  public static HomePageToGame(): void {
    WebElements.HOME_PAGE().style.display = "none";
    WebElements.GAME_PAGE().style.display = "";
  }

  public static UpdateGameCode(code: string): void {
    WebElements.GAME_CODE().innerText = code;
  }

  public static GameToHomePage(): void {
    WebElements.HOME_PAGE().style.display = "";
    WebElements.GAME_PAGE().style.display = "none";
    WebElements.PLAYER_LIST_BODY_HOST().innerHTML = "";
    WebElements.PLAYER_LIST_BODY_PLAYER().innerHTML = "";
  }

  public static PlayerIsHost(): void {
    console.log("Todo: Rework host row to contain start button");
    //WebElements.HOST_ROW().style.display = "";
  }
}
