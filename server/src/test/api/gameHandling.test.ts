import app from "./../../endpoint";
import chai from "chai";
import chaiHttp from "chai-http";
import "mocha";
import {GameManager} from "../../manager/GameManager";
import {Token} from "../../model/Token";
import {TokenManager} from "../../manager/TokenManager";
import {GameToken} from "../../model/GameToken";

chai.use(chaiHttp);

describe("Create and start game", () => {
  it("should return response on call", () => {

    chai.request(app).post("/api/game/create")
      .then(createResponse => {
        chai.expect(createResponse).status(201);

        const token: string = createResponse.text;
        chai.expect(token.length).to.be.equal(8); // TODO: Change to config value

        const gameToken: Token = TokenManager.get().getFromString(token);
        chai.expect(gameToken).instanceOf(GameToken);

        chai.expect(GameManager.get().getByToken(gameToken).getState()).to.be.equal("OPEN_WAITFORPLAYERS");

        chai.request(app).post("/api/game/start").field("token", token).then(startResponse => {
          chai.expect(startResponse).status(202);


        });

        chai.expect(GameManager.get().getByToken(gameToken).getState()).to.be.equal("OPEN_INPROGRESS");
      });
  });
});
