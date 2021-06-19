export function playerListRow(playerName: string, playerToken: string, host: boolean): string {
  console.log("Add player row: " + playerName +", " + playerToken + ", " + host);
  const nameCell: string = "<tr><td>" + playerName + "</td><td>";
  if (host) {
    return nameCell + "<input type='radio' id='" + playerToken + "-narrator' name='narratorSelection'></td>" +
      "<td><button class='btn btn-danger' id='" + playerToken +"-kick'>Kick</button></td></tr>";
  }
  return nameCell + "</tr>";
}
