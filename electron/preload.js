import { contextBridge } from 'electron';

// Expose safe desktop APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isDesktop: true,
});
