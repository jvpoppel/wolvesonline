import {GameManager} from "../manager/GameManager";

export function apiCreateGame(): string {
  return GameManager.get().create().getToken().toString();
}
