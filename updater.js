const updateElectron = require("update-electron-app");
const log = require("electron-log");
class Updater {
    setupAll(app) {
        if (require('electron-squirrel-startup')) {
            return false;
        } else {
            // Setup update checks
            updateElectron({
                repo: 'dialogy-studios/lol-alert-agent', // GitHub repo to check
                updateInterval: '10 minutes',
                logger: log,
                notifyUser: true,
            });
            return true;
        }
    }
}

module.exports = Updater;
