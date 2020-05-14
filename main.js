const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = require('electron');

process.env.NODE_ENV = 'development';

// Set main windows
function createMainWindow() {
    let win = new BrowserWindow({
        webPreferences: {
            // nodeIntegration: true,       // for requiring electron in renderer
        }
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'static/html/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    // set menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
    
}

global.someObject = {
    someProp: 'some value',
}

// Create the main window
app.on('ready', createMainWindow);

// Mac-specific windows behavior
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

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
// Set development menu
if(process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'DevTools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform=='darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                } 
            },
            {
                role: 'reload'
            }
        ]
    })
}