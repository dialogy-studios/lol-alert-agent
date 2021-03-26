const https = require("https");
const {BASE_URL} = require("../Utils/const");

class APIRequest {
    get(endpoint, onEnd, onError) {
        https.get(endpoint, (response) => {
            let data = '';
            response.on("data", (chunk) => data += chunk);
            response.on("end", () => onEnd(response, data));
        })
            .on("error", (e) => onError(e));
    }
}

module.exports = APIRequest;
