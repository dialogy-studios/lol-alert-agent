const GameClient = require("./Services/GameClient");
const Notification = require("./Services/Notification")
const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const firebase = require("firebase/app");
const configs = require("./Utils/configs");
const Updater = require("./updater");
const firebaseApp = firebase.initializeApp(configs.process.env === "production" ?
    configs.firebase.prod :
    configs.firebase.dev);
require("firebase/auth");

if (configs.process.env === "development") {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}


const channels = {
    gameStartChecking: async (event, ...args) => {
        const gameClient = new GameClient();
        const notification = new Notification();
        await gameClient.waitGameStart();
        console.log("Game started!");
        const summonerName = await gameClient.getSummonerName();
        console.log("Summoner name => ", summonerName);
        await notification.sendNotification(summonerName);
        console.log("Notification sent!");
        return summonerName;
    },
    gameEndChecking: async (event, ...args) => {
        const gameClient = new GameClient();
        await gameClient.waitGameEnd();
    }
}


function createWindow () {
    const win = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, contextIsolation: true, enableRemoteModule: false
        },
        resizable: false,
        frame: false,
        icon: __dirname + "/Resources/lol_alert.png"
    });

    ipcMain.handle("game-start-checking", channels.gameStartChecking);
    ipcMain.handle("game-end-checking", channels.gameEndChecking);
    ipcMain.on("reload-page", () => {
        win.reload();
    })
    ipcMain.on("minimize-window", () => win.minimize());
    ipcMain.on("close-window", () => win.close());
    win.loadFile('./index.html')
}

console.log("Resources path => ", process.resourcesPath);
app.whenReady().then(() => {
    const updater = new Updater();
    console.log("process env => ", process.env.FCM_KEY);
    if (updater.setupAll()) {
        createWindow();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
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
