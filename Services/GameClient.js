const {gameClient} = require("../Utils/endpoints");
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
    static Events = {
        IN_LOADING_SCREEN: "gameLoading",
        GAME_STARTED: "gameStarted",
        GAME_ENDED: "gameEnded",
        NOT_IN_GAME: "notInGame"
    }

    events = {};
    unsubscribeToGameClientListen;

    on(event, eventCallback) {
        const {Events} = GameClient;
        const eventsList = Object.values(Events);
        const isValidEvent = eventsList.findIndex((eventName) => eventName === event) > -1;
        if (isValidEvent) {
            this.events.callbacks[event] = eventCallback;
        } else {
            throw new Error(`Invalid events! Available events => ${eventsList}`);
        }
        return this;
    }

    checkIfIsRunning() {
        return this.running;
    }

    async start() {
        const {GAME_STARTED, NOT_IN_GAME, IN_LOADING_SCREEN} = GameClient.Events;
        let gameIsLoading = false;
        this.unsubscribeToGameClientListen = this.listenToGameClientState((state) => {
            switch (state) {
                case "loading": {
                    if (!gameIsLoading) {
                        this.events.callbacks[IN_LOADING_SCREEN]();
                        gameIsLoading = true;
                    }
                    break;
                }
                case "started": {
                    this.events.callbacks[GAME_STARTED]();
                    clearInterval(this.unsubscribeToGameClientListen);
                    break;
                }
                case "invalid": {
                    this.events.callbacks[NOT_IN_GAME]();
                    clearInterval(this.unsubscribeToGameClientListen);
                    break;
                }
            }
        }, () => null);
    }

    stop() {
        this.unsubscribeToGameClientListen != null && clearInterval(this.unsubscribeToGameClientListen);
    }

    listenToGameClientState(callback, onError) {
        return setInterval(async () => {
            try {
                const gameClientState = await this.getGameClientState();
                callback(gameClientState);
            } catch (e) {
                onError();
            }
        }, ONE_SECOND);
    }

    getGameClientState() {
        return new Promise((resolve) => {
            https
                .get(BASE_URL + gameClient.eventData, (res) => {
                    let data = '';
                    res.on("data", (chunk) => data += chunk);
                    res.on("end", () => {
                        const dataJson = JSON.parse(data);
                        if (res.statusCode === 200) {
                            const events = dataJson["Events"];
                            const gameHasBeenStarted = events.find((event) => event["EventName"] === "GameStart") !== undefined;
                            if (gameHasBeenStarted) {
                                resolve("started");
                            } else {
                                resolve("loading");
                            }
                        } else {
                            resolve("loading");
                        }
                    })
                })
                .on("error", (error) => {
                    resolve("invalid");
                })
        });
    }

    static build() {
        const {Events} = GameClient;
        const eventsList = Object.values(Events);
        const eventsCallbacks = {};
        eventsList
            .forEach((event) => eventsCallbacks[event] = () => null);
        const gameClient = new GameClient();
        gameClient.events = {
            eventsAvailable: eventsList,
            eventResults: {},
            callbacks: eventsCallbacks
        }
        return gameClient;
    }
}


module.exports = GameClient;
