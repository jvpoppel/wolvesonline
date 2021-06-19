export interface GameData {
  status: string,
  gameToken?: string,
  playerToken?: string,
  host?: string,
  iteration?: number,
  started?: boolean,
  playerTokens?: string[],
  playerNames?: string[]
}
