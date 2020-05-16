const fs = require('fs');
const path = require('path');
const {ipcRenderer} = require('electron')

let fileNames = [];
let fileNameForm = document.getElementById('fileNameForm');
let titlesList = document.getElementById('titles');
let editSpace = document.getElementById('content');

ipcRenderer.on('file:listSuccess', (event, args) => {
    console.log("Received on renderer: " + args);
    // update it as app grows to make sure files in sidebar are synchronized with events
    fileNames = args;

    titlesList.innerHTML = "";
    
    fileNames.forEach(titleName => {
        console.log("Adding file: " + titleName);
        listElt = document.createElement("li");
        fileText = document.createTextNode(`${titleName.split('.')[0]}`);
        listElt.appendChild(fileText);
        listElt.addEventListener('click', function(e) {
            // @TODO: will it be wise to use IPC for reading large files on main and receiving here?
            fs.readFile('./data/' + titleName, function(err, data) {
                if(err)
                    throw err;
                editSpace.innerHTML = data;
            });
        });
        titlesList.appendChild(listElt);
    })
});
ipcRenderer.on('file:listAddSingular', (event, args) => {
    console.log("Renderer received single file to add named " + args);
    fileNames.push(args);
    console.log("Adding file: " + args);
        listElt = document.createElement("li");
        fileText = document.createTextNode(`${args.split('.')[0]}`);
        listElt.appendChild(fileText);
        listElt.addEventListener('click', function(e) {
            // @TODO: will it be wise to use IPC for reading large files on main and receiving here?
            fs.readFile('./data/' + args, function(err, data) {
                if(err)
                    throw err;
                editSpace.innerHTML = data;
            });
        });
        titlesList.appendChild(listElt);
});
function updateSidebar() {
    ipcRenderer.send('file:list', "");
}
function showNameForm() {
    fileNameForm.style.display = 'block';
    
}
function createNewFile(newFileName) {
    // alert("Enter new file name: ");
    // var fileName = "X";
    // if(fileName != null) {
    //     console.log("Renderer received file name as " + fileName);
    //     ipcRenderer.send('file:new', fileName);
    // } else {
    //     alert("Invalid file name");
    // }
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
})
