"use strict";

// Electronのモジュール
const electron = require('electron');
// 通信するやつ
const ipcMain = electron.ipcMain;
// アプリケーションをコントロールするモジュール
const app = electron.app;

const crypto = require('crypto');
const https = require('https');
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

function readAllJSONAndSend(path, sender) {
    fs.readdir(path, (err, files) => {
        const objects = [];

        for (const file of files) {
            if (fs.statSync(path + "/" + file).isFile() && /.*\.json$/.test(path + "/" + file)) {
                const jsonObject = JSON.parse(fs.readFileSync(path + "/" + file, 'utf8'));
                objects.push(jsonObject);
            } else if (fs.statSync(path + "/" + file).isDirectory()) {
                readAllJSONAndSend(path + "/" + file, sender);
            }
        }

        sender.send("add-member", objects);
    });
}

function downloadFile(url, path) {
    console.log("downloading... " + url);
    path = path.split('\\').join('/');
    let mkdirPath = "./";
    if (path.includes("/")) {
        mkdirPath = path.substring(0, path.lastIndexOf("/"));
    }

    fs.mkdir(mkdirPath, { recursive: true }, (err) => {
        https.get(url, function (res) {
            var outfile = fs.createWriteStream(path, { encoding: "utf-8" });
            res.pipe(outfile);
            res.on('end', function () {
                outfile.close();
            });
        });
    });
}

function updateAllResources() {
    https.get("https://virtualquick.now.sh/fileHashList.json", function (res) {
        var body = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('data', function (chunk) {
            // body の値を json としてパースしている
            res = JSON.parse(body);

            for (const map of res) {
                const filePath = `${__dirname}/${map[0]}`;
                if (!fs.existsSync(filePath)) {
                    downloadFile("https://virtualquick.now.sh/" + map[0], filePath);
                } else {
                    const currentHash = crypto.createHash('sha1').update(fs.readFileSync(filePath)).digest("hex");
                    if (currentHash !== map[1]) {
                        downloadFile("https://virtualquick.now.sh/" + map[0], filePath);
                    }
                }
            }
        })
    }).on('error', function (e) {
        console.log(e.message);
    });
}

// メンバーの情報がリクエストされたら返す
ipcMain.on("request-members-data", (event, arg) => {
    readAllJSONAndSend(`${__dirname}/resource/members`, event.sender);
});

ipcMain.on("open-url", (event, arg) => {
    electron.shell.openExternal(arg);
});

updateAllResources();
