const fs = require('fs');
const path = require('path');

function getFileNames() {
    let names = [];
    fs.readdirSync('./data').forEach((fileName, i) => {
        // console.log(fileName);
        names.push(fileName);
    });
    return names;
}

function updateSidebar() {
    let fileNames = getFileNames();
    let titlesList = document.getElementById('titles');
    let editSpace = document.getElementById('content');
    titlesList.innerHTML = "";
    
    fileNames.forEach(titleName => {
        console.log("Adding file: " + titleName);
        listElt = document.createElement("li");
        fileText = document.createTextNode(`${titleName.split('.')[0]}`);
        listElt.appendChild(fileText);
        listElt.addEventListener('click', function(e) {
            fs.readFile('./data/' + titleName, function(err, data) {
                if(err)
                    throw err;
                editSpace.innerHTML = data;
            });
        });
        titlesList.appendChild(listElt);
    })
}