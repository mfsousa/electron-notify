'use strict'

const electron = require('electron')
const ipc = electron.ipcRenderer
const winId = electron.remote.getCurrentWindow().id

function setStyle(config) {
  // Style it
  let notiDoc = global.window.document
  let container = notiDoc.getElementById('container')
  let appIcon = notiDoc.getElementById('appIcon')
  let image = notiDoc.getElementById('image')
  let title = notiDoc.getElementById('title')
  let text = notiDoc.getElementById('text')
  let close = notiDoc.getElementById('close')
  let message = notiDoc.getElementById('message')
  // Default style
  setStyleOnDomElement(config.defaultStyleContainer, container)
  // Size and radius
  let style = {
    height: config.height - 2 * config.borderRadius - 2 * config.defaultStyleContainer.padding,
    width: config.width - 2 * config.borderRadius - 2 * config.defaultStyleContainer.padding,
    borderRadius: config.borderRadius + 'px'
  }
  setStyleOnDomElement(style, container)
  // Style appIcon or hide
  if (config.appIcon) {
    setStyleOnDomElement(config.defaultStyleAppIcon, appIcon)
    appIcon.src = config.appIcon
  } else {
    setStyleOnDomElement({
      display: 'none'
    }, appIcon)
  }
  setStyleOnDomElement(config.defaultStyleImage, image)
  setStyleOnDomElement(config.defaultStyleClose, close)
  setStyleOnDomElement(config.defaultStyleTextWrapper, text)
  setStyleOnDomElement(config.defaultStyleTitle, title)
  setStyleOnDomElement(config.defaultStyleText, message)
}

function setContents(event, notificationObj) {
  // sound
  if (notificationObj.sound) {
    // Check if file is accessible
    try {
      let audio = new global.window.Audio(notificationObj.sound)
      audio.play()
    } catch (e) {
      log('electron-notify: ERROR could not find sound file: ' + notificationObj.sound.replace('file://', ''), e, e.stack)
    }
  }

  let notiDoc = global.window.document
  // Title
  let titleDoc = notiDoc.getElementById('title')
  titleDoc.innerHTML = notificationObj.title || ''
  // message
  let messageDoc = notiDoc.getElementById('message')
  messageDoc.innerHTML = notificationObj.text || ''
  // Image
  let imageDoc = notiDoc.getElementById('image')
  if (notificationObj.image) {
    imageDoc.src = notificationObj.image
  } else {
    setStyleOnDomElement({ display: 'none'}, imageDoc)
  }

  // Close button
  let closeButton = notiDoc.getElementById('close')
  closeButton.addEventListener('click', function(event) {
    console.log('close')
    event.stopPropagation()
    ipc.send('electron-notify-close', winId, notificationObj)
  })

  // URL
  let container = notiDoc.getElementById('container')
  container.addEventListener('click', function() {
    ipc.send('electron-notify-click', winId, notificationObj)
  })
}

function setStyleOnDomElement(styleObj, domElement) {
  try {
    for (let styleAttr in styleObj) {
      domElement.style[styleAttr] = styleObj[styleAttr]
    }
  } catch (e) {
    throw new Error('electron-notify: Could not set style on domElement', styleObj, domElement)
  }
}

function loadConfig(event, conf) {
  setStyle(conf || {})
}

function reset() {
  let notiDoc = global.window.document
  let container = notiDoc.getElementById('container')
  let closeButton = notiDoc.getElementById('close')

  // Remove event listener
  let newContainer = container.cloneNode(true)
  container.parentNode.replaceChild(newContainer, container)
  let newCloseButton = closeButton.cloneNode(true)
  closeButton.parentNode.replaceChild(newCloseButton, closeButton)
}

ipc.on('electron-notify-set-contents', setContents)
ipc.on('electron-notify-load-config', loadConfig)
ipc.on('electron-notify-reset', reset)

function log() {
  console.log.apply(console, arguments)
}

delete global.require
delete global.exports
delete global.module
