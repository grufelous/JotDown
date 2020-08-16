const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

const noteDataPath = path.join(__dirname, '../../data/notes')

let notesSet = new Set()

// WiFi-specific functions
var wifi = require('node-wifi')

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
    addNoteInput.style.background = '#fff'
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

const noteTitle = document.getElementById('note-title')
const noteWifi = document.getElementById('note-wifi')
const noteTime = document.getElementById('note-time')
const noteContent = document.getElementById('note-content')

function createNoteListItem(noteName) {
    if(notesSet.has(noteName))
        return
    notesSet.add(noteName)
    const item = document.createElement('li')
    const text = document.createTextNode(noteName)
    item.addEventListener('click', () => {
        noteTitle.textContent = noteName
        ipcRenderer.send('note:read', noteName)
        noteContent.innerText = 'Reading file...'
    })
    item.appendChild(text)
    sidebarNoteList.appendChild(item)
}

function pageRendered() {
    ipcRenderer.send('note:list')
}
// IPC functions
ipcRenderer.on('note:create-fail', (event, args) => {
    console.log("Fail creation")
    addNoteInput.value = ''
    addNoteInput.style.background = '#f00'
})

ipcRenderer.on('note:create-success', (event, args) => {
    console.log("Success creation")
    createNoteListItem(args)
    addNoteInput.value = ''
})

ipcRenderer.on('note:loaded', (event, noteList) => {
    console.log("Read stored notes")
    console.log(noteList)
    noteList.forEach((note) => {
        console.log(note)
        createNoteListItem(note)
    })
})

ipcRenderer.on('note:read-success', (event, args) => {
    console.log("Read the clicked note")
    noteContent.innerText = args.text
})

ipcRenderer.on('note:read-fail', (event, args) => {
    console.log("Unable to read given file")
    noteContent.innerText = 'Read failed!'
})