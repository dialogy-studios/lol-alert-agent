const {league} = require("../Utils/endpoints");
const {BASE_URL} = require("../Utils/const");
const {ONE_SECOND, FIVE_SECONDS} = require("../Utils/const");
const rootCert = require('ssl-root-cas').create();
const path = require("path");
const riotGamesCert = path.resolve(__dirname, "..", "riotgames.pem");

rootCert
    .addFile(riotGamesCert);

const https = require('https');
https.globalAgent.options.ca = rootCert;

class GameClient {
    TAG = "[GameClient]";

    async waitGameStart() {
        let gameStarted = false;
        do {
            gameStarted = await this.generatePromiseGameStart();
            await new Promise((resolve) => setTimeout(() => resolve(), ONE_SECOND));
        } while (!gameStarted);
    }

    async waitGameEnd() {
        let gameEnded = false;
        do {
            gameEnded = await this.generatePromiseGameEnd();
            await new Promise((resolve) => setTimeout(() => resolve(), FIVE_SECONDS));
        } while (!gameEnded);
    }

    async getSummonerName() {
        return await this.generatePromiseToActivePlayer();
    }

    generatePromiseGameStart() {
        return new Promise((resolve) => {
            https
                .get(BASE_URL + league.eventData, (res) => {
                    console.log(this.TAG, "Checking game start...");
                    let data = '';
                    res.on("data", (chunk) => data += chunk);
                    res.on("end", () => {
                        const dataJson = JSON.parse(data);
                        if (res.statusCode === 200) {
                            const events = dataJson["Events"];
                            const gameHasBeenStarted = events.find((event) => event["EventName"] === "GameStart") !== undefined;
                            if (gameHasBeenStarted) {
                                console.log(this.TAG, "GAME STARTED!");
                                resolve(true);
                            } else {
                                console.log(this.TAG, "GAME NOT STARTED YET!");
                                resolve(false);
                            }
                        } else {
                            console.log(this.TAG, "GAME NOT STARTED YET!");
                            resolve(false);
                        }
                    })
                })
                .on("error", (error) => {
                    console.log(this.TAG, "ERROR! GAME NOT STARTED YET!");
                    resolve(false);
                })
        });
    }

    generatePromiseGameEnd() {
        return new Promise((resolve) => {
            https
                .get(BASE_URL + league.eventData, (res) => {
                    let data = '';
                    res.on("data", (chunk) => data += chunk);
                    res.on("end", () => {
                        if (res.statusCode === 200) {
                            console.log(this.TAG, "GAME NOT ENDED YET!");
                            resolve(false);
                        }
                    });
                })
                .on("error", (error) => {
                    console.log(this.TAG, "GAME ENDED!");
                    resolve(true);
                });
        });
    }

    generatePromiseToActivePlayer() {
        return new Promise((resolve, reject) => {
            https
                .get(BASE_URL + league.activePlayer, (res) => {
                    let data = '';
                    res.on("data", (chunk) => data += chunk);
                    res.on("end", () => {
                        const jsonData = JSON.parse(data);
                        const summonerName = jsonData["summonerName"];
                        if (summonerName) {
                            resolve(summonerName);
                        } else {
                            reject("Invalid summoner nick!");
                        }
                    })
                })
                .on("error", (error) => {
                    resolve(null);
                })
        })
    }
}


module.exports = GameClient;
