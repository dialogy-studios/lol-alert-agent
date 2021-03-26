const http = require("http");
const {FUNCTIONS_BASE_URL} = require("../Utils/const");
const {functions} = require("../Utils/endpoints");
class Notification {
    async sendNotification(summonerName){
        this.generateNotificationPromise(summonerName);
    }

    generateNotificationPromise(summonerName) {
        return new Promise((resolve, reject) => {
            http
                .get(FUNCTIONS_BASE_URL + functions.sendNotification(summonerName), (res) => {
                    res.on("end", () => {
                        resolve();
                    })
                })
                .on("error", (e) => reject(e))
        })
    }
}

module.exports = Notification;
