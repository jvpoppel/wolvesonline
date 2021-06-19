export interface GameData {
  status: string,
  gameToken?: string,
  playerToken?: string,
  iteration?: number,
  gameState?: string,
  playerTokens?: string[],
  playerNames?: string[]
}
