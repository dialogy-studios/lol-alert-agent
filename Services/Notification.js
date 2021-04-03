const rootCert = require('ssl-root-cas').create();
const path = require("path");
const riotGamesCert = path.resolve(__dirname, "..", "riotgames.pem");
rootCert
    .addFile(riotGamesCert);

const https = require('https');
https.globalAgent.options.ca = rootCert;
const {FUNCTIONS_BASE_URL} = require("../Utils/const");
const {functions} = require("../Utils/endpoints");
class Notification {
    async sendNotification(summonerName, notificationType){
        return this.generateNotificationPromise(summonerName, notificationType);
    }

    generateNotificationPromise(summonerName, notificationType) {
        return new Promise((resolve, reject) => {
            const url = FUNCTIONS_BASE_URL + functions.sendNotification[notificationType](summonerName);
            https
                .get(url, (res) => {
                    res.on("end", () => {
                        resolve();
                    })
                })
                .on("error", (e) => reject(e))
        })
    }
}

module.exports = Notification;
