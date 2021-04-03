const endpoints = {
    leagueClient: {
        matchMaking: {
            session: "/lol-champ-select/v1/session",
            searchState: "/lol-lobby/v2/lobby/matchmaking/search-state",
        },
        lobby: {

        },
        summoner: {
            currentSummoner: "/lol-summoner/v1/current-summoner"
        }
    },
    gameClient: {
        eventData: "/liveclientdata/eventdata",
        activePlayer: "/liveclientdata/activeplayer",

    },
    functions: {
        sendNotification: {
            gameStarted:  (summonerName) => `/sendNotification/gameStarted/${summonerName}`,
            matchFound:  (summonerName) => `/sendNotification/matchFound/${summonerName}`
        }
    }

}

module.exports = endpoints
