const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Send messages to main process
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['new-chat', 'app-version'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Receive messages from main process
  receive: (channel, func) => {
    let validChannels = ['new-chat', 'app-version'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // Get app version
  getVersion: () => process.versions.electron,
  
  // Check if running in Electron
  isElectron: true
});

// Handle window controls
window.addEventListener('DOMContentLoaded', () => {
  // You can add any initialization code here
  console.log('Electron app loaded');
});
