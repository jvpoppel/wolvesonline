import {Director} from "../manager/Director";
import {TSMap} from "typescript-map";

export function apiCreateGame(): TSMap<string, string> {
  return Director.get().createGameForPlayer();
}
