const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	chooseLas: () => ipcRenderer.invoke('choose-las'),
	chooseOutDir: () => ipcRenderer.invoke('choose-outdir'),
	runConvert: (payload) => ipcRenderer.invoke('run-convert', payload),
	onLog: (cb) => ipcRenderer.on('log', (_e, line) => cb(line)),
	getLogoPath: () => ipcRenderer.invoke('get-logo')
});


