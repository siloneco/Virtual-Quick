"use strct";

// Electronのモジュール
const electron = require('electron');
// 通信するやつ
const ipcMain = electron.ipcMain;
// アプリケーションをコントロールするモジュール
const app = electron.app;

const path = require('path');
const fs = require('fs');

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow = null;

// 全てのウィンドウが閉じたら終了
app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});

// Electronの初期化完了後に実行
app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1700,
        height: 850,
        useContentSize: true,
        webPreferences: {
            // レンダラープロセスで Node.js 使えないようにする (XSS対策)
            nodeIntegration: false,
            // preloadスクリプトを, app.htmlとは別のJavaScriptコンテキストで実行するかどうか
            // false にしないと、window object を共有できない
            contextIsolation: false,
            // process や Electron を windowオブジェクト に保存する処理。フルパスの指定が必要
            preload: path.join(__dirname, '/preload.js'),
        },
    });

    mainWindow.webContents.openDevTools();
    mainWindow.setMinimumSize(350, 300);
    //使用するhtmlファイルを指定する
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
});

// メンバーの情報がリクエストされたら返す
ipcMain.on("request-members-data", (event, arg) => {
    fs.readdir('./debugData/members', function (err, files) {
        if (err) throw err;
        var fileList = files.filter(function (file) {
            return fs.statSync('./debugData/members/' + file).isFile() && /.*\.json$/.test('./debugData/members/' + file); //絞り込み
        })

        const objects = [];

        for (file of fileList) {
            const jsonObject = JSON.parse(fs.readFileSync("./debugData/members/" + file, 'utf8'));
            objects.push(jsonObject);
        }

        event.sender.send("add-member", objects);
    });
});

ipcMain.on("open-url", (event, arg) => {
    electron.shell.openExternal(arg);
    console.log("test");
})