import {WebElements} from "./WebElements";

export class DisplayManager {
  public static HomePageToGame(): void {
    WebElements.HOME_PAGE().style.display = "none";
    WebElements.GAME_PAGE().style.display = "";
  }

  public static UpdateGameCode(code: string): void {
    WebElements.GAME_CODE().innerText = code;
  }

  public static PlayerIsHost(): void {
    WebElements.HOST_ROW().style.display = "";
  }
}
