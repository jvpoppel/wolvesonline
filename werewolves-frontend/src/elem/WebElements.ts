export class WebElements {

  /* Home page */
  public static HOME_PAGE(): HTMLElement { return document.getElementById("container-home");}
  public static CREATE_GAME(): HTMLElement { return document.getElementById("createBtn");}
  public static JOIN_TOKEN(): HTMLElement { return document.getElementById("joinGameToken");}
  public static JOIN_BUTTON(): HTMLElement { return document.getElementById("joinBtn");}

  /* Game page */
  public static GAME_PAGE(): HTMLElement { return document.getElementById("container-game");}
  public static ROLE_INFO_BUTTON(): HTMLElement { return document.getElementById("showRoleInfo");}
  public static GAME_CODE(): HTMLElement { return document.getElementById("gameCode");}

  /* HOST CONTROLS */
  public static HOST_ROW(): HTMLElement { return document.getElementById("row-host");}
  public static WEREWOLVES_BTN(): HTMLElement { return document.getElementById("werewolves");}
  public static ZIENER_BTN(): HTMLElement { return document.getElementById("ziener");}

  /* VOTING CONTROLS */
  public static VOTE_ROW(): HTMLElement { return document.getElementById("row-vote");}
  public static VOTE_LIST(): HTMLElement { return document.getElementById("voteList");}
}
