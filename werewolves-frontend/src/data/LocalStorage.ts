/**
 * Static class containing methods to get or set local storage
 */
export class LocalStorage {
  public static gameToken(): string | null {
    return localStorage.getItem("gameToken");
  }

  public static setGameToken(gameToken: string): void {
    localStorage.setItem("gameToken", gameToken);
  }

  public static playerToken(): string | null {
    return localStorage.getItem("playerToken");
  }

  public static setPlayerToken(playerToken: string): void {
    localStorage.setItem("playerToken", playerToken);
  }
}
