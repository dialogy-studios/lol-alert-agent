const path = require("path");

module.exports = {
    packagerConfig: {
        icon: __dirname + "/Resources/lol_alert.ico",
        name: "LoL Alert"
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            platforms: ["darwin", "win64", "win32", "linux"],
            config: {
                name: "lol_alert",
                iconUrl: __dirname + "/Resources/lol_alert.ico",
                setupIcon: __dirname + "/Resources/lol_alert.ico",
                loadingGif: __dirname + "/Resources/lol-alert-install-gif.gif",
                noMsi: false,
                owners: "dialogy-studios",
                setupExe: "LoL Alert.exe",
                setupMsi:"lol-alert.msi"
            }
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: [
                "darwin"
            ]
        },
        {
            name: "@electron-forge/maker-deb",
            config: {}
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {}
        }
    ]
}



