const { contextBridge, ipcRenderer } = require('electron');

// 通过受控的桥暴露给渲染进程，避免开启 nodeIntegration
contextBridge.exposeInMainWorld('catAPI', {
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  getWorkArea: () => ipcRenderer.invoke('get-work-area'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  getCursorPos: () => ipcRenderer.invoke('get-cursor-pos')
});
