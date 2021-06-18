import {Logger} from "winston";
import express = require("express");
import {apiCreateGame} from "./api/APICreateGame";
import {apiStartGame} from "./api/APIStartGame";
import {apiJoinGame} from "./api/APIJoinGame";
import {apiReconnectGame} from "./api/APIReconnectGame";
import {TSMap} from "typescript-map";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require("winston");

const app = express();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  defaultMeta: {service: "user-service"},
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({filename: "error.log", level: "error"}),
    new winston.transports.File({filename: "combined.log"}),
  ],
});

logger.add(new winston.transports.Console({
  format: winston.format.simple(),
}));

app.use(express.static(__dirname + "/../../werewolves-frontend/dist/werewolves-frontend/"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/../../werewolves-frontend/dist/werewolves-frontend/index.html"));
});

/*

            START API ROUTING

 */
app.post("/api/game/create", function (req, res) {
  logger.info("[EXPRESS] Creating new game");
  const response: TSMap<string, string> = apiCreateGame();
  res.status(201).send(JSON.stringify({"playerToken": response.get("playerToken"), "gameToken": response.get("gameToken")}));
});

app.post("/api/game/join", function(req, res) {
  logger.info("[EXPRESS] Attempting to join game " + req.body.gameToken);
  const gameResponse = apiJoinGame(req.body.gameToken);
  if (gameResponse == undefined) {
    res.status(400).send("Could not join game.");
  } else {
    res.status(200).send(gameResponse); // Return player token
  }
});

app.post("/api/game/reconnect", function(req, res) {
  logger.info("[EXPRESS] Player " + req.body.playerToken + " is attempting to rejoin game " + req.body.gameToken);
  const gameResponse = apiReconnectGame(req.body.playerToken, req.body.gameToken);
  if (gameResponse == undefined) {
    res.status(200).send(JSON.stringify({"connected": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"connected": "success"})); // Return game token
  }
});

app.post("/api/game/start", function (req, res) {
  logger.info("[EXPRESS] Attempting to start game with token " + req.body.token);
  const response: boolean = apiStartGame(req.body.token);
  if (!response) {
    res.status(400).send(JSON.stringify({"started": "failed"})); // Game could not be started. Is given token correct or has it already been started?
  } else {
    res.status(202).send(JSON.stringify({"started": "success"}));
  }
});
/*

            START GENERAL HTML ROUTING

*/
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname + "/../../werewolves-frontend/dist/werewolves-frontend/index.html"));
});

app.listen(80, function () { // TODO: Port should be configurable
  logger.info("App is listening on port {0}!".replace("{0}", "2306"));
});

/*

            END GENERAL HTML ROUTING

 */
export function getLogger(): Logger {
  return logger;
}

export default app;
