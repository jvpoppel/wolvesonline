import {Logger} from "winston";
import express = require("express");
import {apiCreateGame} from "./api/APICreateGame";
import {apiStartGame} from "./api/APIStartGame";
import {apiJoinGame} from "./api/APIJoinGame";
import {apiReconnectGame} from "./api/APIReconnectGame";
import { Config } from "./Config";
import {TSMap} from "typescript-map";
import {apiGetGameIteration} from "./api/APIGetGameIteration";
import {apiGetGameData} from "./api/APIGetGameData";
import {apiKickPlayer} from "./api/APIKickPlayer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require("winston");

const app = express();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: Config = require("./../config.json");

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
/*
  Create game, return created playerToken and gameToken
 */
app.post("/api/game/create", function (req, res) {
  logger.info("[EXPRESS] Creating new game");
  const response: TSMap<string, string> = apiCreateGame(req.body.playerName);
  res.status(201).send(JSON.stringify({"playerToken": response.get("playerToken"), "gameToken": response.get("gameToken")}));
});

/*
  Join game for player, return joined gameToken and created playerToken
 */
app.post("/api/game/join", function(req, res) {
  logger.info("[EXPRESS] Attempting to join game " + req.body.gameToken);
  const gameResponse = apiJoinGame(req.body.gameToken, req.body.playerName);
  if (gameResponse == undefined) {
    res.status(400).send("Could not join game.");
  } else {
    res.status(200).send(gameResponse); // Return player token
  }
});

/*
  Reconnect to game with given gameToken and playerToken, "success" if succeeded, "failed" otherwise.
 */
app.post("/api/game/reconnect", function(req, res) {
  logger.info("[EXPRESS] Player " + req.body.playerToken + " is attempting to rejoin game " + req.body.gameToken);
  const gameResponse = apiReconnectGame(req.body.playerToken, req.body.gameToken);
  if (gameResponse == undefined) {
    res.status(200).send(JSON.stringify({"connected": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"connected": "success"})); // Return game token
  }
});

/*
  Start game with given gameToken
 */
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
  GET iteration of given gameToken. Playertoken also sent to check if player actually is in game
 */
app.get("/api/game/:gametoken/:playertoken/iteration", function(req, res) {
  const response: string = apiGetGameIteration(req.params.gametoken, req.params.playertoken);
  if (response === "-1") {
    res.status(400).send(JSON.stringify({"iteration": response}));
  } else {
    res.status(200).send(JSON.stringify({"iteration": response}));
  }
});

/*
  POST get Game Data, given a gametoken, playertoken and client-iteration, return:
  status 304 iff clientIteration = serverIteration
  status 400 iff gameToken or playerToken incorrect
  status 200 with gameData in json format
 */
app.post("/api/game/:gametoken/:playertoken/data", function(req, res) {
  const response: any = apiGetGameData(req.params.gametoken, req.params.playertoken, req.body.iteration);
  if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else if (response === "notChanged") {
    res.status(304);
  } else {
    res.status(200).json(response);
  }
});

/*
  POST kick Player from Game.
  status 401 iff supposedHost != host of given game
  status 400 iff playerToken or gameToken not valid, or if player not in game.
  status 200 iff player has been kicked from the game.
 */
app.post("/api/game/:gametoken/:playertoken/kick", function(req, res) {
  logger.info("[EXPRESS] Player " + req.body.host + " attempts to kick " + req.params.playertoken + " from game " + req.params.gametoken);
  const response: string = apiKickPlayer(req.params.playertoken, req.body.host, req.params.gametoken);
  if (response === "unauthorized") {
    res.status(401).send(JSON.stringify({"status": "failed"}));
  } else if (response === "failed") {
    res.status(400).send(JSON.stringify({"status": "failed"}));
  } else {
    res.status(200).send(JSON.stringify({"status": "success"}));
  }
});
/*

            START GENERAL HTML ROUTING

*/
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname + "/../../werewolves-frontend/dist/werewolves-frontend/index.html"));
});

app.listen(config.port, function () {
  logger.info("App is listening on port {0}!".replace("{0}", config.port+""));
});

/*

            END GENERAL HTML ROUTING

 */
export function getLogger(): Logger {
  return logger;
}

export default app;
