import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

// const isProd = process.env.NODE_ENV === "production";
const isProd = false;

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 550,
    icon: "./favicon.ico",
    resizable: false,
    show: false,
    width: 600
  });

  require('electron-dl')();

  if (isProd) {
    mainWindow.loadFile(path.join(__dirname, "./index.html"));
    require("update-electron-app")();
  } else {
    mainWindow.loadURL("http://localhost:3000/");
    require("electron-debug")({showDevTools: true, enabled: true});
  }

  require("./main/sparkmax");
  require("./main/config");

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.show();
    if (!isProd) {
      mainWindow.webContents.openDevTools({mode: "detach"});
    }
  });

  mainWindow.setMenu(null);

  mainWindow.on("closed", () => {
    setTimeout(() => {
      ipcMain.emit("kill-server");
    }, 250);

    (mainWindow as any) = null;
  });
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});