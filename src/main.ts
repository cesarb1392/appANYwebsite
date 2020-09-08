import { app, BrowserWindow } from "electron";
import * as path from "path";
import { CONFIG } from "./config";
const { shell } = require("electron");

let mainWindow: Electron.BrowserWindow;

export const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    fullscreen: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.resolve(path.join(__dirname, "preload.js")),
    },
    titleBarStyle: "hidden",
    title: CONFIG.APP_TITLE,
    backgroundColor: CONFIG.APP_BACKGROUND_COLOR,
    width: CONFIG.APP_WIDTH,
    height: CONFIG.APP_HEIGHT,
    icon: path.join(__dirname, "public", "assets", "favicon.ico"),
  });
  if (process.env.NODE_ENV === "development") {
    if (CONFIG.ELECTRON_DISABLE_SECURITY_WARNINGS) {
      process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";
    }
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    return shell.openExternal(url);
  });
  mainWindow.on("closed", (): void => {
    mainWindow = null;
  });
  mainWindow.loadURL(CONFIG.START_URL).then((): void => {
    mainWindow = null;
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", (): void => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", (): void => {
  if (mainWindow === null) {
    createWindow();
  }
  mainWindow.show();
});

app.on("browser-window-focus", () => {
  if (process.platform === "darwin") {
    app.dock.setBadge("");
  }
});

switch (process.argv[1]) {
  case "--squirrel-install":
  case "--squirrel-updated":
  case "--squirrel-obsolete":
    app.quit();
}
