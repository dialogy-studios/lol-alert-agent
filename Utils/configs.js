const env = process.env.NODE_ENV || 'development';
const firebase = {
    dev: {},/*TODO*/
    prod: {}/*TODO*/
}

module.exports = {
    process: {
        env
    },
    firebase
}

