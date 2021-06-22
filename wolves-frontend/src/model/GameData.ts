export interface GameData {
  status: string,
  gameState?: string,
  gameToken?: string,
  playerToken?: string,
  host?: string,
  iteration?: number,
  started?: boolean,
  finished?: boolean,
  winningRole?: string,
  playerTokens?: string[],
  playerNames?: string[],
  playerRoles?: string[],
  playersAliveInGame?: string[]
  role?: string,
  roleDescription?: string,
  alive?: boolean,
  substate?: string,
  voteIteration?: number,
  rolesStillInNight?: string[],
  playersKilledInNight?: string[],
  playersStillNeedingToVote?: string[],
  voteWinner?: string
}
