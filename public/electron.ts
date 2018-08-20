import { app, BrowserWindow } from "electron";
import * as path from "path";

const isProd = process.env.NODE_ENV === "production";

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    height: 550,
    icon: "./favicon.ico",
    resizable: false,
    show: false,
    width: 600
  });

  if (isProd) {
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3000/");
  }

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.show();
    if (!isProd) {
      mainWindow.webContents.openDevTools({mode: "detach"});
    }
  });

  mainWindow.setMenu(null);

  mainWindow.on("closed", () => {
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