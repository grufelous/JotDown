const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

const noteDataPath = path.join(__dirname, '../../data/notes')
// WiFi-specific functions
var wifi = require("node-wifi")
wifi.init({
    iface: null
})
function scanSSID() {
    wifi.scan(function(err, networks) {
        if(err) {
            console.log("WiFi scan error: ", err)
        } else {
            console.log("WiFi networks scanned: ", networks)
        }
    })
}

// page functions
let addNoteForm = document.getElementById('add-note-form')
const addNoteSubmitBtn = document.getElementById('add-note-submit')
const addNoteBtn = document.getElementById('add-note-btn')
const addNoteInput = document.getElementById('add-note-input')

addNoteInput.addEventListener('keyup', function(e) {
    if(e.which==13)             //prevent enter key submission
        return false
    console.log(e.target.value)
    if(e.target.value.length==0) {
        addNoteSubmitBtn.disabled = true
        return
    } else {
        addNoteSubmitBtn.disabled = false
    }
    
})
addNoteForm.addEventListener('submit', function(e) {
    e.preventDefault()
    console.log(e.target[0].value)
    if(e.target[0].value.length==0) {
        return
    }
    fs.readdir(noteDataPath, function(err, files) {
        if(err) {
            console.log("File read err in checkExistance: ", err)
            return
        }
        files.forEach(function(f) {
            if(fs.statSync(path.join(noteDataPath, f)).isDirectory() && f==e.target[0].value) {
                console.log("Matches existing folder: ", f)
                e.target[0].value = ''
                return
            }
        })
    })
    
})
function toggleAddNote() {
    addNoteInput.value = ''
    if(addNoteForm.style.display!='block') {
        addNoteBtn.textContent='-'
        addNoteForm.style.display='block'
    } else {
        addNoteBtn.textContent='+'
        addNoteForm.style.display='none'
    }
}
const addNoteDiscardBtn = document.getElementById('add-note-discard')
addNoteDiscardBtn.addEventListener('click', function(e) {
    e.preventDefault()
    document.getElementById('add-note-input').innerText = ''
    addNoteForm.style.display='none'
    addNoteBtn.textContent='+'
})