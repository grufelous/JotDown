const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain} = require('electron');

process.env.NODE_ENV = 'development';

const noteDataPath = path.join(__dirname, 'data/notes')

// Set main windows
function createMainWindow() {
    let win = new BrowserWindow({
        width: 960,
        height: 600,
        webPreferences: {
            nodeIntegration: true,       // for requiring electron/ipcRenderer in renderer
        }
    });
    win.on('closed', function() {
        app.quit();
    });
    let devToolsWin = new BrowserWindow({
        width: 340,
        height: 600,
    });
    if(process.env.NODE_ENV != 'production') {
        win.webContents.setDevToolsWebContents(devToolsWin.webContents);
        win.webContents.openDevTools({mode: 'detach'})
        win.webContents.once('did-finish-load', function () {
            let windowBounds = win.getBounds();
            devToolsWin.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
        });
    }
    win.on('move', function () { 
        let windowBounds = win.getBounds();
        devToolsWin.setPosition(windowBounds.x + windowBounds.width, windowBounds.y);
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

// global.someObject = {
//     someProp: 'some value',
// }

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

// Main menu template
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
    },
    {
        label: 'Edit',
        role: 'editMenu'
    },
    {
        label: 'View',
        role: 'viewMenu',
    },
    {
        label: 'Window',
        role: 'windowMenu',
    }
]

// Set development menu in non-production
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

ipcMain.on('note:list', (event, args) => {
    console.log("Reading notes to list")
    try {
        fs.readdir(noteDataPath, (err, files) => {
            if(err) {
                console.log("Error while reading note files")
            } else {
                let noteList = []
                files.forEach((file) => {
                    noteList.push(file)
                })
                event.sender.send('note:loaded', noteList)
            }
        })
    } catch (err) {
        if(err.code=='ENOENT') {
            fs.mkdirSync(noteDataPath, {recursive: true})
        } else {
            console.log("Error while loading note files: ", err)
        }
    }
})
ipcMain.on('note:create', (event, newNoteName) => {
    console.log("Creating note: ", newNoteName)
    let found = false
    try {
        fs.readdirSync(noteDataPath).forEach((file, i) => {
            console.log(file)
            if(fs.statSync(path.join(noteDataPath, file)).isDirectory() && file==newNoteName) {
                console.log("Matched")
                event.sender.send('note:create-fail', '')
                found = true
                return
            }
        })
    } catch (err) {
        if(err.code=='ENOENT') {
            fs.mkdirSync(noteDataPath, {recursive: true})
        } else {
            console.log("Error while creating note files: ", err)
            event.sender.send('note:create-fail', '')
        }
    }
    
    if(!found) {
        const curData = path.join(noteDataPath, newNoteName)
        fs.mkdir(curData, {recursive: true}, (err) => {
            if(err) {
                console.log("Error creating folder on main thread: ", err)
                event.sender.send('note:create-fail', '')
            } else {
                fs.writeFileSync(path.join(curData, 'note.md'), "")
                fs.writeFileSync(path.join(curData, 'reminders.json'), "")
                event.sender.send('note:create-success', newNoteName)
            }
        })
        
    }
})
ipcMain.on('note:read', (event, noteName) => {
    const noteDir = path.join(noteDataPath, noteName)
    console.log("Reading on main: ", noteName)
    fs.readFile(path.join(noteDir, 'note.md'), 'utf8', (err, data) => {
        if(err) {
            console.log("Error reading folder on main thread: ", err)
        } else {
            console.log(data)
            event.sender.send('note:read-success', {'text': data})
        }
    })
    
})

// File IPC events received
/*
ipcMain.on('file:save', (event, args) => {
    console.log("Received on main with arg: " + JSON.stringify(args));
    let filePath = path.join(__dirname, 'data');
    filePath = path.join(filePath, args.name);
    console.log(filePath);
    fs.writeFile(filePath, args.content, function(err) {
        if(err) {
            console.log("Error in writing file: " + err);
            throw err;
        }
        console.log("Successfully saved the file");
        event.sender.send('file:saveSuccess', args.name);
    });
});
ipcMain.on('config:save', (event, args) => {
    console.log("Received config on main with arg: " + JSON.stringify(args));
    let filePath = path.join(__dirname, 'data');
    filePath = path.join(filePath, args.name);
    console.log(filePath);
    fs.writeFile(filePath, JSON.stringify(args.content), function(err) {
        if(err) {
            console.log("Error in writing config file: " + err);
            throw err;
        }
        console.log("Successfully saved the config file");
        // event.sender.send('file:saveSuccess', args.name);
    });
});*/