/**
 * preload.js
 * process や Electron を windowオブジェクト に保存する処理
 */
const { electron, ipcRenderer } = require('electron');

window.onload = function () {
    window.jQuery = window.$ = require('jquery');

    $("head").append('<script type="text/javascript" src="js/index.js"></script>');
    $("head").append('<script type="text/javascript" src="js/switch-content.js"></script>');
}

process.once('loaded', () => {
    // console.log('---- preload.js loaded ----');
    global.process = process;
    global.electron = electron;
    global.module = module;
    global.ipcRenderer = ipcRenderer;
});