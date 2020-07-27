const fs = require('fs');
const path = require('path');
const {ipcRenderer} = require('electron')

var wifi = require("node-wifi");

// List of all files in the data directory
let fileNames = [];
let fileNameForm = document.getElementById('fileNameForm');
let titlesList = document.getElementById('titles');
let editSpace = document.getElementById('contentDisplay');
let fileSaveBtn = document.getElementById('fileSaveBtn');
let fileTitleLabel = document.getElementById('fileTitle');

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});

fileSaveBtn.addEventListener('click', function() {
    let fileName = fileTitleLabel.innerText + '.md';
    let fileContent = editSpace.value;
    let fileData = {
        'name': fileName,
        'content': fileContent
    }
    console.log(fileData);
    ipcRenderer.send('file:save', fileData);
    fileSaveBtn.setAttribute('disabled', 'true');
})
editSpace.addEventListener('keydown', function() {
    fileSaveBtn.textContent = "Save";
    fileSaveBtn.removeAttribute('disabled');
})

function appendAllToList() {
    fileNames.forEach(fileName => appendSingleToList(fileName));
}

function appendSingleToList(fileName) {
    console.log("Adding file in fileNames list to sidebar: " + fileName);
    listElt = document.createElement('li');
    fileTitle = document.createTextNode(`${fileName.split('.')[0]}`);
    listElt.appendChild(fileTitle);
    listElt.addEventListener('click', function(e) {
        fileSaveBtn.textContent = "Save";
        fs.readFile('./data/' + fileName, function(err, data) {
            if(err)
                throw err;
            editSpace.innerText = data;
        });
        console.log("Clicked on " + fileName);
        fileTitleLabel.innerText = fileName.split('.')[0];
    });
    titlesList.appendChild(listElt);
}

ipcRenderer.on('file:listSuccess', (event, args) => {
    console.log("Received on renderer: " + args);
    // update it as app grows to make sure files in sidebar are synchronized with events
    fileNames = args;

    titlesList.innerHTML = "";
    
    appendAllToList();
});
ipcRenderer.on('file:listAddSingular', (event, args) => {
    console.log("Renderer received single file to add to list " + args);
    fileNames.push(args);
    appendSingleToList(args);
});
ipcRenderer.on('file:saveSuccess', (event, args) => {
    fileSaveBtn.textContent = "Saved";
});
function updateSidebar() {
    ipcRenderer.send('file:list', "");
}
function toggleNameForm() {
    (fileNameForm.style.display == 'block') ? fileNameForm.style.display = 'none' : fileNameForm.style.display = 'block';
}
fileNameForm.addEventListener('submit', function(e) {
    e.preventDefault();
    let newFileName = e.target[0].value + ".md";
    console.log("Attempting to create new file: " + newFileName);
    console.log("We got the following files: ");
    fileNames.forEach(fileName => {
        console.log(fileName);
        if(fileName == newFileName) {
            alert("Pre-existing file");
            newFile = false;
            // break;       // this breaks the flow - makes the renderer refresh
            return;
        }
    });
    if(newFileName != null) {
        ipcRenderer.send('file:new', newFileName);
    }
    fileNameForm.style.display = 'none';
})

function scanNetworks() {
    // Scan networks
    wifi.scan(function(err, networks) {
        if (err) {
        console.log(err);
        } else {
        console.log(networks);
        /*
            networks = [
                {
                    ssid: '...',
                    bssid: '...',
                    mac: '...', // equals to bssid (for retrocompatibility)
                    channel: <number>,
                    frequency: <number>, // in MHz
                    signal_level: <number>, // in dB
                    quality: <number>, // same as signal level but in %
                    security: 'WPA WPA2' // format depending on locale for open networks in Windows
                    security_flags: '...' // encryption protocols (format currently depending of the OS)
                    mode: '...' // network mode like Infra (format currently depending of the OS)
                },
                ...
            ];
            */
        }
    });
}

function connectNetwork() {
    // Connect to a network
    wifi.connect({ ssid: "ssid", password: "password" }, function(err) {
        if (err) {
            console.log(err);
        }
        console.log("Connected");
    });
  
}

function currentNetwork() {
    // List the current wifi connections
    wifi.getCurrentConnections(function(err, currentConnections) {
        if (err) {
            console.log(err);
        }
        console.log(currentConnections);
        /*
        // you may have several connections
        [
            {
                iface: '...', // network interface used for the connection, not available on macOS
                ssid: '...',
                bssid: '...',
                mac: '...', // equals to bssid (for retrocompatibility)
                channel: <number>,
                frequency: <number>, // in MHz
                signal_level: <number>, // in dB
                quality: <number>, // same as signal level but in %
                security: '...' //
                security_flags: '...' // encryption protocols (format currently depending of the OS)
                mode: '...' // network mode like Infra (format currently depending of the OS)
            }
        ]
        */
    });
}
// All functions also return promise if there is no callback given
/*wifi
  .scan()
  .then(function(networks) {
    // networks
  })
  .catch(function(error) {
    // error
  });*/