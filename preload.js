const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
    waitGameStart: async () => await ipcRenderer.invoke("game-start-checking"),
    waitGameEnd: async () => await ipcRenderer.invoke("game-end-checking"),
    reloadPage: () => ipcRenderer.send("reload-page"),
    minimizeWindow: () => ipcRenderer.send("minimize-window"),
    closeWindow: () => ipcRenderer.send("close-window")
})
