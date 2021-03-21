const https = require("https");
const {BASE_URL} = require("../Utils/const");

class APIRequest {
    get(endpoint, onEnd, onError) {
        https.get(BASE_URL + endpoint, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on("end", () => onEnd(res, data));
        })
            .on("error", (e) => onError(e));
    }
}

module.exports = APIRequest;
