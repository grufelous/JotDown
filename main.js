const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = require('electron');

function createMainWindow() {
    let win = new BrowserWindow({});
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'static/html/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    // set menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
    
}

// Create the main window
app.on('ready', createMainWindow);

// Mac-specific windows behavior
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: (process.platform!='darwin') ? 'Ctrl+Q' : 'Command+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]