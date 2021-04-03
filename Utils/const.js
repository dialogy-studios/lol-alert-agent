const {process} = require("./configs");
const ONE_SECOND = 1000;
const FIVE_SECONDS = 5000;
const ONE_MINUTE = 60000
const THIRD_SECONDS = 30000;
const BASE_URL = "https://127.0.0.1:2999";
const FUNCTIONS_BASE_URL = process.env === "production" ? "https://us-central1-lol-alert-prod.cloudfunctions.net" : "https://us-central1-lol-alert-prod.cloudfunctions.net";
module.exports = {
    ONE_SECOND,
    FIVE_SECONDS,
    THIRD_SECONDS,
    ONE_MINUTE,
    BASE_URL,
    FUNCTIONS_BASE_URL,
}
