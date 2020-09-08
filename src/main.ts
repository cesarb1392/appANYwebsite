import { app, BrowserWindow } from "electron";
import * as path from "path";

const { shell } = require("electron");
require("dotenv").config();

let mainWindow: Electron.BrowserWindow;

export const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    fullscreen: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.resolve(path.join(__dirname, "/preload.js")),
    },
    titleBarStyle: "hidden",
    title: "Banana App",
    // backgroundColor: "",
    width: parseInt(process.env.APP_HEIGHT),
    height: parseInt(process.env.APP_HEIGHT),
    icon: path.join(__dirname, "public", "assets", "favicon-mac.ico"),
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  } else {
    // process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";
  }

  mainWindow.webContents.on("new-window", (e, url) => {
    e.preventDefault();
    return shell.openExternal(url);
  });
  mainWindow.on("closed", (): void => {
    mainWindow = null;
  });
  mainWindow.loadURL(process.env.START_URL).then((): void => {
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
