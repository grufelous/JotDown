const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow} = require('electron');

function createMainWindow() {
    let win = new BrowserWindow({});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'static/html/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
}

app.on('ready', createMainWindow);