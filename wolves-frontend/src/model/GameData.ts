export interface GameData {
  status: string,
  gameToken?: string,
  playerToken?: string,
  host?: string,
  iteration?: number,
  started?: boolean,
  finished?: boolean,
  playerTokens?: string[],
  playerNames?: string[],
  role?: string,
  roleDescription?: string
}
