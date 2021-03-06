const Loader = () => {
    return '<div class="loader-container">' +
                '<div id="loader"/>' +
            '</div>';
}

const LoLAlertStatusRunning = () => {
    return '<div>' +
            '<div class="game-status-container">' +
                '<h2 id="game-status-text">LoL Alert is running!</h2>' +
            '</div>' +
            Loader() +
            '<div class="connected-summoner-container">' +
                '<span id="connected-summoner"> </span>' +
            '</div>' +
        '</div>'
}
/*deprecated*/
const processGameStart = (summonerName) => {
    const loader = document.getElementById("loader");
    const gameStatusText = document.getElementById("game-status-text");
    const connectedSummonerLabel = document.getElementById("connected-summoner");
    loader.remove();
    gameStatusText.textContent = "The match has been started!";
    connectedSummonerLabel.textContent = `Connected summoner name => ${summonerName}`;
}

/*deprecated*/
const processGameEnd = () => {
    const {api} = window;
    api
        .reloadPage();
}

/*deprecated*/
const requestGameChecking = async () => {
    const {api} = window;
    try {
        const summonerName = await api.waitGameStart();
        processGameStart(summonerName);
        await api.waitGameEnd();
        processGameEnd();
    } catch (e) {
        console.log("Error => ", e.message);
    }
}

window.addEventListener("load",   () => {
    const {api} = window;
    const root = document.getElementById("root-container");
    const div = document.createElement("div");
    div.innerHTML = LoLAlertStatusRunning();
    while (div.firstChild) {
        root.appendChild(div.firstChild);
    }
    const minimizeBtn = document.getElementById("minimize-button");
    const closeBtn = document.getElementById("close-button");
    minimizeBtn.addEventListener("click", () => api.minimizeWindow());
    closeBtn.addEventListener("click", () => api.closeWindow());
})
