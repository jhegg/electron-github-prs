/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-undef */
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRendererInvoke: (channel, ...args) => {
    return ipcRenderer.invoke(channel, ...args)
  }
})
