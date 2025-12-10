// Preload script for security
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  tournaments: {
    getAll: () => ipcRenderer.invoke('tournaments:getAll'),
    create: (name) => ipcRenderer.invoke('tournaments:create', name),
    update: (tournament) => ipcRenderer.invoke('tournaments:update', tournament),
    getPath: () => ipcRenderer.invoke('tournaments:getPath'),
    saveParticipantImage: (tournamentName, fileName, base64Data) => 
      ipcRenderer.invoke('tournaments:saveParticipantImage', tournamentName, fileName, base64Data),
    getImageData: (tournamentName, imagePath) =>
      ipcRenderer.invoke('tournaments:getImageData', tournamentName, imagePath),
  }
});
