const GameClient = require("./Services/GameClient");
const Notification = require("./Services/Notification")
const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const firebase = require("firebase/app");
const configs = require("./Utils/configs");
const Updater = require("./updater");
const endpoints = require("./Utils/endpoints");
const LeagueClient = require("./Services/LeagueClient");
require("firebase/auth");

const LCUConnector = require('lcu-connector');
let lcuConnector;

if (configs.process.env === "development") {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

function initializeLCU() {
    let leagueClient, gameClient;
    const handleLCUEvents = async ({username, password, address, port}) => {
        const notification = new Notification();
        let currentSummoner = null, summonerName;
        leagueClient = new LeagueClient()
            .password(password).user(username).server(address).port(port)
            .build()
            .on("lobby", () => console.log("Summoner is in the lobby!")) /*not emitted*/
            .on("searching", () => console.log("Summoner is searching!!!")) /*not emitted*/
            .on("foundMatch", () => {
                notification.sendNotification(summonerName, "matchFound");
                console.log("Found match!");
            })
            .on("enterChampSelect", () => console.log("Entered champ select!")) /*not emitted*/
            .on("leaveChampSelect", () => console.log("Summoner leave from champ select!!")) /*not emitted*/
            .on("gameStarting", async () => {
                console.log("Game starting...");
                leagueClient.stop();
                gameClient.start();
            })
        gameClient = GameClient
            .build()
            .on("gameLoading", () => console.log("Loading game!"))
            .on("gameStarted", () => {
                console.log("Game started!");
                notification.sendNotification(summonerName, "gameStarted");
                gameClient.stop();
                leagueClient.start();
            })
            .on("gameEnded", async () => console.log("Game ended!"))
            .on("notInGame", () => {
                console.log("Summoner is not in game!!");
                gameClient.stop();
                leagueClient.start();
            });
        leagueClient.start();
        const subscriptionToGetCurrentSummoner = setInterval(async () => {
            try {
                currentSummoner = await leagueClient.getCurrentSummoner();
                summonerName = currentSummoner.displayName;
                if (summonerName)clearInterval(subscriptionToGetCurrentSummoner);
            } catch (e) {
                console.log(e.message);
            }
        }, 1000)
    }

    const clearLCUEvents = async () => {
        if (leagueClient) {
            leagueClient.stop();
        }

        if (gameClient) {
            gameClient.stop();
        }
    }
    const lcuConnector = new LCUConnector();
    lcuConnector
        .on("connect", handleLCUEvents)
        .on("disconnect", clearLCUEvents);
    return lcuConnector;
}

function createWindow () {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, contextIsolation: true, enableRemoteModule: false,
        },
        resizable: false,
        frame: false,
        icon: __dirname + "/Resources/lol_alert.png"
    });

    configs.process.env == "development" && win.webContents.openDevTools();
    ipcMain.on("reload-page", () => {
        win.reload();
    });
    ipcMain.on("minimize-window", () => win.minimize());
    ipcMain.on("close-window", () => win.close());
    win.loadFile('./index.html');
    lcuConnector = initializeLCU();
    lcuConnector
        .start();
}

app.whenReady().then(() => {
    const updater = new Updater();
    if (updater.setupAll()) {
        createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    } else {
        app.quit();
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
