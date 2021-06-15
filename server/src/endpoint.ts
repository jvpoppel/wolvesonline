import {Logger} from "winston";
import express = require("express");
import {apiCreateGame} from "./api/APICreateGame";
import {apiStartGame} from "./api/APIStartGame";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const winston = require("winston");

const app = express();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

const logger = winston.createLogger({
  level: "info",
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
  const response: string = apiCreateGame();
  logger.info("Created game with token " + response);
  res.status(201).send(response);
});

app.post("/api/game/start", function (req, res) {
  logger.info(req.body);
  logger.info("Attempting to start game with token " + req.body.token);
  const response: boolean = apiStartGame(req.body.token);
  if (!response) {
    res.status(400).send("Game could not be started. Is given token correct or has it already been started?");
  } else {
    res.status(202).send("Success");
  }
});
/*

            START GENERAL HTML ROUTING

*/
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname + "/../../werewolves-frontend/dist/werewolves-frontend/index.html"));
});

app.listen(2306, function () {
  logger.info("App is listening on port {0}!".replace("{0}", "2306"));
});

/*

            END GENERAL HTML ROUTING

 */
export function getLogger(): Logger {
  return logger;
}

export default app;
