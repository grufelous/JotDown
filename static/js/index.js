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
    wifi.scan((err, networks) => {
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
const sidebarNoteList = document.getElementById('sidebar-list')

addNoteInput.addEventListener('keyup', (e) => {
    if(e.which==13)             //prevent enter key submission
        return false
    console.log(e.target.value)
    addNoteInput.style.background = '#fff'
    if(e.target.value.length==0) {
        addNoteSubmitBtn.disabled = true
        return
    } else {
        addNoteSubmitBtn.disabled = false
    }
    
})
addNoteForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const fileName = e.target[0].value
    console.log(fileName)
    if(fileName==0) {
        return
    }
    ipcRenderer.send('note:create', fileName)
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
addNoteDiscardBtn.addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('add-note-input').innerText = ''
    addNoteForm.style.display='none'
    addNoteBtn.textContent='+'
})

ipcRenderer.on('note:create-fail', (event, args) => {
    console.log("Fail creation")
    addNoteInput.value = ''
    addNoteInput.style.background = '#a00'
})

ipcRenderer.on('note:create-success', (event, args) => {
    console.log("Success creation")
    // const newListItem = document.createElement('li')
    
    sidebarNoteList.appendChild(document.createElement('li').appendChild(document.createTextNode(args)))
    addNoteInput.value = ''
})