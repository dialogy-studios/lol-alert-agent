const updateElectron = require("update-electron-app")();
const log = require("electron-log");
class Updater {
    setupAll() {
        return !require('electron-squirrel-startup');
    }
}

module.exports = Updater;
