import {Director} from "../manager/Director";

export function apiNightAction(action: string, gameToken: string, playerToken: string): string {
  return Director.get().performNightAction(action, gameToken, playerToken);
}
