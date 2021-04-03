const { contextBridge, ipcRenderer } = require('electron');

/*deprecated*/
contextBridge.exposeInMainWorld("api", {
    waitGameStart: async () => await ipcRenderer.invoke("game-start-checking"),
    waitGameEnd: async () => await ipcRenderer.invoke("game-end-checking"),
    reloadPage: () => ipcRenderer.send("reload-page"),
    minimizeWindow: () => ipcRenderer.send("minimize-window"),
    closeWindow: () => ipcRenderer.send("close-window"),
    subscribeToMainChannelEvents: () => ipcRenderer.on("main-channel", (event, data) => console.log("data received from main channel!", data))
})
