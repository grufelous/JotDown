const { ipcRenderer } = require('electron')

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
const addNoteBtn = document.getElementById('add-note-btn')
addNoteForm.addEventListener('submit', function(e) {
    e.preventDefault()
    console.log(e.target[0].value)
})
function toggleAddNote() {
    if(addNoteForm.style.display=='none') {
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