const fs = require('fs');
const path = require('path');
const {ipcRenderer, net} = require('electron')

var wifi = require("node-wifi");

// List of all files in the data directory
let fileNames = [];
let savedSSID = [];
let currentSSID = [];
let fileNameForm = document.getElementById('fileNameForm');
let titlesList = document.getElementById('titles');
let editSpace = document.getElementById('contentDisplay');
let fileSaveBtn = document.getElementById('fileSaveBtn');
let fileTitleLabel = document.getElementById('fileTitle');
let ssidPicker = document.getElementById('ssid-picker');

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
    let configName = fileTitleLabel.innerText + '.json';
    let configContent = {}
    currentSSID.forEach((network) => {
        if(network.ssid == ssidPicker.value) {
            console.log("Found ", ssidPicker.value)
            configContent['ssid'] = ssidPicker.value
            configContent['mac'] = network.mac
        }
    })
    let configData = {
        'name': configName,
        'content': configContent
    }
    console.log("Config data: ", configContent)
    console.log(fileData);
    ipcRenderer.send('file:save', fileData);
    ipcRenderer.send('config:save', configData);
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
            editSpace.innerText = "";
            editSpace.innerText = data;
            console.log("Read: ", data);
        });
        
        getSSIDConfig(fileName)
        // let ssidLabel = document.createElement('option')
        // const readSSID = getSSIDConfig(fileName)
        // ssidLabel.value = readSSID;
        // ssidLabel.text = readSSID;
        // ssidPicker.add(ssidLabel);
        // ssidPicker.set
        
        console.log("Clicked on " + fileName);
        fileTitleLabel.innerText = fileName.split('.')[0];
    });
    titlesList.appendChild(listElt);
}

function checkSSIDAvailable(ssid, mac) {
    currentSSID.forEach((network) => {
        
    })
}

function getSSIDConfig(fileName) {
    configFile = fileName.split('.')[0] + '.json';
    let ssid = "None"
    fs.readFile('./data/' + configFile, function(err, data) {
        if(err)
            throw err;
        const readConfigData = JSON.parse(data)
        // console.log("Config read: ", readConfigData);
        ssid = readConfigData.ssid;
        let ssidLabel = document.createElement('option')
        ssidLabel.value = readConfigData.ssid;
        ssidLabel.text = "Saved: " + readConfigData.ssid;
        ssidPicker.add(ssidLabel);
        console.log("Option length: ", ssidPicker.length);
        console.log("Selected option: ", ssidPicker.selectedIndex)
        
        ssidPicker.selectedIndex = ssidPicker.length-1;
    })
}

function loadConfig() {
    fileNames.forEach((fileName) => {
        configFile = fileName.split('.')[0] + '.json';
        fs.readFile('./data/' + configFile, function(err, data) {
            if(err)
                throw err;
            const readConfigData = JSON.parse(data)
            console.log("Loaded config: ", readConfigData);
            let readNetwork = {
                'ssid': readConfigData.ssid,
                'mac': readConfigData.mac
            }
            console.log("Read SSID in config: ", readNetwork);
            
            // console.log("Read config and found: ", currentSSID.find(readNetwork))
            
            currentSSID.forEach((network) => {
                if(network.ssid == readNetwork.ssid && network.mac == readNetwork.mac) {
                    console.log("Found ", fileName.split('.')[0]);
                }
            })
        })
    })
}
ipcRenderer.on('file:listSuccess', (event, args) => {
    console.log("Listing was success\nReceived on renderer: " + args);
    // update it as app grows to make sure files in sidebar are synchronized with events
    fileNames = args;

    titlesList.innerHTML = "";
    
    appendAllToList();
    loadConfig();
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
    console.log("Refreshed")
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
    updateSidebar();
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

function scanSSID() {
    wifi.scan(function(err, networks) {
        if(err) {
            console.log("WiFi SSID error", err);
        } else {
            console.log(networks);
            networks.forEach((network, i) => {
                x = {
                    'ssid': network.ssid, 'mac': network.mac
                }
                currentSSID.push(x);
            });
            currentSSID.forEach(net => {
                let ssidOpt = document.createElement('option')
                ssidOpt.text = net.ssid
                ssidOpt.value = net.ssid
                ssidPicker.add(ssidOpt)
            })
        }
    });
    console.log("Scanned");
}

function readSSID() {
    fs.readFile('./data/config/ssid.json', function(err, data) {
        if(err)
            throw err;
        console.log("SSID: ", data);
    });
}

function saveSSID() {
    
}

function pageRendered() {
    updateSidebar();
    scanSSID();
}