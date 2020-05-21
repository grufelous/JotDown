const fs = require('fs');
const path = require('path');
const {ipcRenderer} = require('electron')

// List of all files in the data directory
let fileNames = [];
let fileNameForm = document.getElementById('fileNameForm');
let titlesList = document.getElementById('titles');
let editSpace = document.getElementById('contentDisplay');
let fileEditBtn = document.getElementById('fileSaveBtn');

fileEditBtn.addEventListener('click', function() {
    // @TODO: add save functionality
})
editSpace.addEventListener('keydown', function() {
    fileEditBtn.removeAttribute('disabled');
})

// editSpace.onkeyup = e => {
//     console.log("Content changed!");
//     if(!document.title.endsWith('*')) {
//         document.title += '*';
//     }
//     console.log(e.target);
//     ipcRenderer.send('file:needSave', {
//         content: e.target.innerText
        
//     });
// }

function appendAllToList() {
    fileNames.forEach(fileName => {
        console.log("Adding file in fileNames list to sidebar: " + fileName);
        listElt = document.createElement('li');
        fileTitle = document.createTextNode(`${fileName.split('.')[0]}`);
        listElt.appendChild(fileTitle);
        listElt.addEventListener('click', function(e) {
            fs.readFile('./data/' + fileName, function(err, data) {
                if(err)
                    throw err;
                editSpace.innerText = data;
            });
        });
        titlesList.appendChild(listElt);
    });
}

function appendSingleToList(fileName) {
    console.log("Adding file in fileNames list to sidebar: " + fileName);
    listElt = document.createElement('li');
    fileTitle = document.createTextNode(`${fileName.split('.')[0]}`);
    listElt.appendChild(fileTitle);
    listElt.addEventListener('click', function(e) {
        fs.readFile('./data/' + fileName, function(err, data) {
            if(err)
                throw err;
            editSpace.innerText = data;
        });
    });
    titlesList.appendChild(listElt);
}

ipcRenderer.on('file:listSuccess', (event, args) => {
    console.log("Received on renderer: " + args);
    // update it as app grows to make sure files in sidebar are synchronized with events
    fileNames = args;

    titlesList.innerHTML = "";
    
    appendAllToList();
    // fileNames.forEach(titleName => {
    //     console.log("Adding file: " + titleName);
    //     listElt = document.createElement("li");
    //     fileText = document.createTextNode(`${titleName.split('.')[0]}`);
    //     listElt.appendChild(fileText);
    //     listElt.addEventListener('click', function(e) {
    //         // @TODO: will it be wise to use IPC for reading large files on main and receiving here?
    //         fs.readFile('./data/' + titleName, function(err, data) {
    //             if(err)
    //                 throw err;
    //             editSpace.innerHTML = data;
    //         });
    //     });
    //     titlesList.appendChild(listElt);
    // })
});
ipcRenderer.on('file:listAddSingular', (event, args) => {
    console.log("Renderer received single file to add to list " + args);
    fileNames.push(args);
    appendSingleToList(args);
    // listElt = document.createElement("li");
    // fileText = document.createTextNode(`${args.split('.')[0]}`);
    // listElt.appendChild(fileText);
    // listElt.addEventListener('click', function(e) {
    //     console.log(e);
    //     console.log("Clicked file: " + args);
    //     // @TODO: will it be wise to use IPC for reading large files on main and receiving here?
    //     fs.readFile('./data/' + args, function(err, data) {
    //         if(err) {
    //             console.log("Error while reading file: " + err);
    //             throw err;
    //         }
    //         editSpace.innerText = data;
    //         // Nothing works post this - @TODo fix!
    //         console.log(editSpace.innerHTML);
    //         alert("Clicked");
    //         // editSpace.attributes.setNamedItem('location', args);
    //         // alert(editSpace.attributes.getNamedItem('location'));
    //         // console.log("Set location attribute as: " + editSpace.attributes.getNamedItem('location'));
    //     });
    //     titlesList.appendChild(listElt);
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
