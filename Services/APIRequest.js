const https = require("https");
const {BASE_URL} = require("../Utils/const");
const rootCert = require('ssl-root-cas').create();

rootCert
    .addFile(process.cwd() + '/riotgames.pem');

require('https').globalAgent.options.ca = rootCert;
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
