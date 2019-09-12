import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";

// const isProd = process.env.NODE_ENV === "production";
const isProd = false;

let mainWindow: Electron.BrowserWindow;

if (!isProd) {
  require("electron-debug")({showDevTools: true});
}

/**
 * Simply put, creates the main window that our application resides in. Technically, this function can be called
 * multiple times to create multiple windows.
 */
function createWindow() {

  /*
   * Main window dimensions, properties, and launch icon. All properties can be found at
   * https://electronjs.org/docs/api/browser-window
   */
  mainWindow = new BrowserWindow({
    height: 550,
    icon: "./favicon.ico",
    resizable: false,
    show: false,
    width: 600
  });

  // Node module that handles all of our native firmware file download requests. It is initialized here.
  require('electron-dl')();

  /*
   * In production, we want to load a different index.html file as well as initialize the update-electron-app module.
   * During development, we want the spare electron-debug window as well as to load the react development server.
   */
  if (isProd) {
    mainWindow.loadFile(path.join(__dirname, "./index.html"));

    const {autoUpdater} = require("electron-updater");

    // autoUpdater.checkForUpdatesAndNotify();

    // When an update has been detected that it is available
    autoUpdater.on("update-available", () => {
      mainWindow.webContents.send("install-available");
    });

    // When an update is not available.
    autoUpdater.on("update-not-available", () => {
      mainWindow.webContents.send("install-not-available");
    });

    // When the update has been downloaded and is ready to be installed, notify the renderer process.
    autoUpdater.on('update-downloaded', () => {
      console.log("Successfully downloaded update.");
      mainWindow.webContents.send('install-ready');
    });

    autoUpdater.on("download-progress", (downloadJSON: any) => {
      mainWindow.webContents.send("install-progress", downloadJSON);
    });

    // When receiving an updateCheck signal, let's check if there's a new version available!
    ipcMain.on("update-check", () => {
      autoUpdater.autoDownload = false;
      autoUpdater.checkForUpdates().then(() => {
        console.log("Finished checking for update. Sending results back to user.");
      });
    });

    // When the user wants to download the update
    ipcMain.on("install-download", () => {
      console.log("Downloading update...");
      autoUpdater.downloadUpdate();
    });

    // When receiving a quitAndInstall signal, quit and install the new version
    ipcMain.on("install-new", () => {
      autoUpdater.quitAndInstall();
    });

  } else {
    mainWindow.loadURL("http://localhost:3000/");
  }

  /* These are the two main process files associated with our program. They deal with everything with the SPARK MAX
   * Controller as well as the main application configuration.
   */
  require("./main/sparkmax");
  require("./main/config");

  /* There are plenty of events to listen for in the window's webContents property. This specific event fires when
   * the window itself is not only initialized, but it's rendered web page has finished loading. This provides a smooth
   * transition from application launch to application render.
   */
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.show();
  });

  // If we wanted a standard menubar with our application, we would remove this line of code.
  mainWindow.setMenu(null);

  /* Uniquely enough, our application starts a process on boot. Once the window has fires the 'closed' event, we
   * also want to kill that process we started to prevent any memory leaks or possible operating system slowdown.
   */
  mainWindow.on("closed", () => {
    // De-referencing our window object.
    (mainWindow as any) = null;
  });
}

// Once the application hasbeen requested to launch, and electron has loaded it's dependencies, create the window.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    setTimeout(() => {
      app.quit();
      ipcMain.emit("kill-server");
    }, 250);
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});