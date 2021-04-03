const btoa = require("btoa");
const endpoints = require("../Utils/endpoints");
const {ONE_SECOND} = require("../Utils/const");
const rootCert = require('ssl-root-cas').create();
const path = require("path");
const riotGamesCert = path.resolve(__dirname, "..", "riotgames.pem");
rootCert
    .addFile(riotGamesCert);

const https = require('https');
https.globalAgent.options.ca = rootCert;


class LeagueClient {
    Events = {
        IS_IN_THE_LOBBY: "lobby",
        SEARCHING: "searching",
        FOUND_MATCH: "foundMatch",
        ENTER_CHAMP_SELECT: "enterChampSelect",
        LEAVE_CHAMP_SELECT: "leaveChampSelect",
        GAME_STARTING: "gameStarting"
    }

    username = null;
    pwd = null;
    serverAddress = null;
    serverPort = null;
    url = null;
    permission = null;
    events;
    running = false;
    unsubscribeToChampSelectState;
    unsubscribeToMatchFound;

    start() {
        const {GAME_STARTING, FOUND_MATCH} = this.Events;
        this.unsubscribeToMatchFound = this.startListenToMatchFound((res) => {
            if (res === "Found") {
                this.events.callbacks[FOUND_MATCH]();
                clearInterval(this.unsubscribeToMatchFound);
                setTimeout(() => {
                    this.stop();
                    this.start();
                }, 15000)
            }
        }, () => null);
        this.unsubscribeToChampSelectState = this.startListenChampSelectState((state) => {
            if (state === "GAME_STARTING") {
                this.events.callbacks[GAME_STARTING]();
                clearInterval(this.unsubscribeToChampSelectState);
            }
        }, () => null);
    }
    stop() {
        this.running = false;
        this.unsubscribeToChampSelectState != null && clearInterval(this.unsubscribeToChampSelectState);
        this.unsubscribeToMatchFound != null && clearInterval(this.unsubscribeToMatchFound);
    }
    on(event, eventCallback) {
        const isValidEvent = this.events.eventNames.findIndex((eventName) => eventName === event) > -1;
        if (isValidEvent) {
            this.events.callbacks[event] = eventCallback;
        } else {
            throw new Error(`Invalid event! Events available => ${Object.values(this.Events)}`);
        }
        return this;
    }

    startListenChampSelectState(callback, onError) {
        return setInterval(async () => {
            try {
                const champSelectState = await this.getChampSelectState();
                callback(champSelectState);
            } catch (e) {
                onError();
            }
        }, ONE_SECOND)
    }
    startListenToMatchFound(callback, onError) {
        return setInterval(async () => {
            try {
                const matchMakingState = await this.getMatchMakingState();
                callback(matchMakingState);
            } catch (e) {
                onError();
            }
        }, 500);
    }

    summonerInChampSelect() {
        return new Promise((resolve, reject) => {
            https
                .get(this.url + endpoints.leagueClient.matchMaking.session,
                    {
                        headers: {
                            "Authorization": `Basic ${this.permission}`
                        }
                    },
                    (res) => {
                        let data = "";
                        res.on("data", (chunk) => data += chunk);
                        res.on("end", () => {
                            if (res.statusCode !== 200) {
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        })
                    }
                )
                .on("error", () => resolve(false))
        })
    }

    getCurrentSummoner() {
        return new Promise((resolve, reject) => {
            https
                .get(
                    this.url + endpoints.leagueClient.summoner.currentSummoner,
                    {
                        headers: {
                            "Authorization": `Basic ${this.permission}`
                        }
                    },
                    (res) => {
                        let data = "";
                        res.on("data", (chunk) => data += chunk);
                        res.on("end", () => {
                            const currentSummoner = JSON.parse(data);
                            resolve(currentSummoner);
                        })
                    }
                )
                .on("error", (e) => reject(e));
        })
    }

    getMatchMakingState() {
        return new Promise((resolve, reject) => {
            https
                .get(this.url + endpoints.leagueClient.matchMaking.searchState,
                    {
                        headers: {
                            "Authorization": `Basic ${this.permission}`
                        }
                    },
                    (res) => {
                        let data = "";
                        res.on("data", (chunk) => data += chunk);
                        res.on("end", () => {
                            if (res.statusCode !== 200) resolve(false);
                            const matchMakingState = JSON.parse(data);
                            resolve(matchMakingState.searchState)
                        })
                    })
                .on("error", (error) => {
                    reject(error);
                })
        })
    }

    getChampSelectState() {
        return new Promise((resolve, reject) => {
            const url = this.url + endpoints.leagueClient.matchMaking.session;
            https
                .get(url,
                    {
                        headers: {
                            "Authorization": `Basic ${this.permission}`
                        },

                    },
                    (res) => {
                        let data = "";
                        res.on("data", (chunk) => data += chunk);
                        res.on("end", () => {
                            if (res.statusCode === 200) {
                                const sessionData = JSON.parse(data);
                                resolve(sessionData.timer.phase);
                            }
                            resolve("");
                        })
                    })
                .on("error", (e) => reject(e))
        })
    }
    user(username) {
        this.username = username;
        return this;
    }

    password(password) {
        this.pwd = password;
        return this;
    }

    server(server) {
        this.serverAddress = server;
        return this;
    }

    port(port) {
        this.serverPort = port;
        return this;
    }

    build() {
        if (!this.username) throw new Error("User is invalid!");
        if (!this.pwd) throw new Error("Password is invalid!");
        if (!this.serverAddress) throw new Error("Server is invalid!");
        if (!this.serverPort) throw new Error("Server port is invalid!");
        this.url = `https://${this.serverAddress}:${this.serverPort}`;
        this.permission = btoa(`${this.username}:${this.pwd}`);
        const eventCallbacks = {};
        Object
            .values(this.Events)
            .forEach((event) => eventCallbacks[event] = () => null)
        this.events = {
            eventNames: Object.values(this.Events),
            eventResults: {},
            callbacks: eventCallbacks
        }
        return this;
    }
}

module.exports = LeagueClient;
