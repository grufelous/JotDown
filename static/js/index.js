const fs = require('fs');
const path = require('path');
const {ipcRenderer} = require('electron')

// List of all files in the data directory
let fileNames = [];
let fileNameForm = document.getElementById('fileNameForm');
let titlesList = document.getElementById('titles');
let editSpace = document.getElementById('contentDisplay');
let fileSaveBtn = document.getElementById('fileSaveBtn');
let fileTitleLabel = document.getElementById('fileTitle');

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
