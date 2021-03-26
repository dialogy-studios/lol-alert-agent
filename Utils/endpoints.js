const endpoints = {
    league: {
        eventData: "/liveclientdata/eventdata",
        activePlayer: "/liveclientdata/activeplayer"
    },
    functions: {
        sendNotification: (summonerName) => `/sendNotification/${summonerName}`
    }

}

module.exports = endpoints
