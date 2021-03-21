const endpoints = require("../Utils/endpoints");
const {BASE_URL} = require("../Utils/const");
const https = require("https");
const rootCert = require('ssl-root-cas').create();
const APIRequest = require("./APIRequest");
const GameStart = require("../Observers/GameStart");
const {ONE_SECOND, ONE_MINUTE} = require("../Utils/const");

rootCert
    .addFile(process.cwd() + '/riotgames.pem');

require('https').globalAgent.options.ca = rootCert;
class GameClient {
    gameStartObserver = new GameStart();
    gameHandlers = {
        start: {
            https: {
                onEnd: (res, events) => {
                    const jsonEvents = JSON.parse(events);
                    if (res.statusCode === 200) {
                        const startEvent = jsonEvents["Events"].find((event) => event["EventID"] === 0);
                        console.log("Game Started! Waiting for the end...");
                        console.log("Game started at => ", startEvent["EventTime"]);
                        this.gameStartObserver.clearListener();
                        this.checkGameEndMoment();
                    } else {
                        console.log("Game not started yet...");
                    }
                },
                onError: (error) => {
                    console.log("Probably the player isn't in a match. Error => ", error.message);
                }
            }
        },
        end: {
            https: {
                onEnd: (res, data) => {
                    if (res.statusCode === 404) {
                        console.log("Game not started yet...");
                    } else {
                        console.log("Game not ended yet...");
                    }
                },
                onError: (error) => {
                    console.log("Probably game end! Error => ", error.message);
                    this.gameStartObserver.clearListener();
                    this.gameStartObserver.setListener(
                        () => this.checkGameEvent(this.gameHandlers.start.https.onEnd, this.gameHandlers.start.https.onError),
                        ONE_SECOND);
                }
            }
        }
    }

    checkGameEvent(onEnd, onError) {
        const apiService = new APIRequest();
        apiService.get(endpoints.eventData, onEnd, (e) => onError(e));
    }

    checkGameStartMoment() {
        this.gameStartObserver.setListener(
            () => this.checkGameEvent(this.gameHandlers.start.https.onEnd, this.gameHandlers.start.https.onError),
            ONE_SECOND);
    }

    checkGameEndMoment() {
        this.gameStartObserver.setListener(
            () => this.checkGameEvent(this.gameHandlers.end.https.onEnd, this.gameHandlers.end.https.onError),
            ONE_MINUTE);
    }
}


module.exports = GameClient;
