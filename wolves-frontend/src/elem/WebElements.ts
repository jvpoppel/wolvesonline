export class WebElements {

  /* Loading */
  public static LOADING_PAGE(): HTMLElement { return document.getElementById("container-loading");}

  /* Home page */
  public static HOME_PAGE(): HTMLElement { return document.getElementById("container-home");}
  public static CREATE_GAME(): HTMLElement { return document.getElementById("createBtn");}
  public static JOIN_TOKEN(): HTMLElement { return document.getElementById("joinGameToken");}
  public static JOIN_BUTTON(): HTMLElement { return document.getElementById("joinBtn");}
  public static PLAYER_NAME(): HTMLElement { return document.getElementById("playerName");}

  /* Game page */
  public static GAME_PAGE(): HTMLElement { return document.getElementById("container-game");}
  public static ROLE_INFO_BUTTON(): HTMLElement { return document.getElementById("showRoleInfo");}
  public static GAME_CODE(): HTMLElement { return document.getElementById("gameCode");}
  public static PLAYER_LIST_HOST(): HTMLElement { return document.getElementById("playerListForHost");}
  public static PLAYER_LIST_PLAYER(): HTMLElement { return document.getElementById("playerListForPlayers");}
  public static PLAYER_LIST_BODY_HOST(): HTMLElement { return document.getElementById("player-list-body-host");}
  public static PLAYER_LIST_BODY_PLAYER(): HTMLElement { return document.getElementById("player-list-body-player");}
  public static KICK_PLAYER(playerToken: string): HTMLElement { return document.getElementById(playerToken + "-kick");}
  public static START_DISCONNECT_BUTTONS(): HTMLElement { return document.getElementById("row-player-startstop");}
  public static DISCONNECT(): HTMLElement { return document.getElementById("disconnect");}
  public static START(): HTMLElement { return document.getElementById("start");}
  public static NARRATOR_RADIOBUTTONS(): NodeListOf<HTMLElement> { return document.getElementsByName("narratorSelection");}
  public static SUBSTATE_ROW(): HTMLElement { return document.getElementById("row-substate");}
  public static SUBSTATE_VALUE(): HTMLElement { return document.getElementById("subState");}

  /* Night */
  public static NIGHT_SELECTION_ROW(): HTMLElement { return document.getElementById("row-night-role-selection");}
  public static START_NIGHT(): HTMLElement { return document.getElementById("startNight");}
  public static FINISH_NIGHT(): HTMLElement { return document.getElementById("finishNight");}
  public static WOLVES_NIGHT(): HTMLElement { return document.getElementById("werewolves-night");}
  public static MEDIUM_NIGHT(): HTMLElement { return document.getElementById("medium-night");}

  /* Role information */
  public static ROLE_NAME(): HTMLElement { return document.getElementById("roleName");}
  public static ROLE_INFO(): HTMLElement { return document.getElementById("roleInformation");}

  /* VOTING CONTROLS */
  public static VOTE_ROW(): HTMLElement { return document.getElementById("row-vote");}
  public static VOTE_LIST(): HTMLElement { return document.getElementById("voteList");}
}
